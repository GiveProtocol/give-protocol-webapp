-- GIV-233: Fix search_charity_organizations returning no results
--
-- Root causes identified:
--
-- 1. MISSING EXECUTE GRANT
--    The search_charity_organizations function was created without an explicit
--    GRANT EXECUTE to anon/authenticated roles. Newer Supabase instances revoke
--    the default PostgreSQL PUBLIC EXECUTE privilege, so the function is
--    inaccessible via PostgREST. The service silently returns EMPTY_RESULT on any
--    error, so users see "no results" instead of a permission error.
--
-- 2. search_vector NOT GUARANTEED TO BE POPULATED
--    The GIN index migration (20260406000001) assumed search_vector was
--    "pre-populated" by the IRS data import pipeline. If the column is NULL for
--    any rows (e.g. newly-seeded dev environments, incremental imports), the
--    full-text search branch in the optimised RPC (20260406000002) returns zero
--    rows because NULL @@ tsq evaluates to NULL (not TRUE).
--
-- Fixes applied in this migration:
--
--   A. Add search_vector column if missing (idempotent).
--   B. Backfill NULL search_vector values from name + sort_name + ein.
--   C. Add a trigger so future INSERTs/UPDATEs auto-populate search_vector.
--   D. Recreate GIN index (IF NOT EXISTS – no-op if already present).
--   E. Grant EXECUTE to anon, authenticated, and service_role.
--   F. Replace search_charity_organizations with a version that falls back to
--      ILIKE for rows where search_vector IS NULL, preserving full performance
--      when the column is populated while remaining correct when it is not.

-- ─────────────────────────────────────────────────────────────────────────────
-- A. Ensure search_vector column exists
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE charity_organizations
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- ─────────────────────────────────────────────────────────────────────────────
-- B. Backfill NULL search_vector values
--    Uses the same fields as the original full-text index:
--    name, sort_name (may be NULL), and ein.
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE charity_organizations
SET search_vector = to_tsvector(
  'english',
  coalesce(name, '') || ' ' ||
  coalesce(sort_name, '') || ' ' ||
  coalesce(ein, '')
)
WHERE search_vector IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- C. Trigger to auto-populate search_vector on future writes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_charity_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.sort_name, '') || ' ' ||
    coalesce(NEW.ein, '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trig_sync_charity_search_vector ON charity_organizations;
CREATE TRIGGER trig_sync_charity_search_vector
  BEFORE INSERT OR UPDATE OF name, sort_name, ein
  ON charity_organizations
  FOR EACH ROW
  EXECUTE FUNCTION sync_charity_search_vector();

-- ─────────────────────────────────────────────────────────────────────────────
-- D. GIN index (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_charity_organizations_search_vector
  ON charity_organizations USING gin (search_vector);

-- ─────────────────────────────────────────────────────────────────────────────
-- E. Grant EXECUTE so PostgREST can call the function via the anon/auth keys
-- ─────────────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION search_charity_organizations(TEXT, TEXT, TEXT, VARCHAR, INT, INT)
  TO anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- F. Replace RPC with null-safe version
--    Keeps the EIN fast-path and the GIN full-text fast-path.
--    When search_vector IS NULL on a row, falls back to ILIKE so results are
--    always returned even in environments that have not run the data import.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_charity_organizations(
  search_query TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_ntee  TEXT DEFAULT NULL,
  filter_country VARCHAR(2) DEFAULT NULL,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  ein                TEXT,
  name               TEXT,
  city               TEXT,
  state              TEXT,
  zip                TEXT,
  ntee_cd            TEXT,
  deductibility      TEXT,
  is_on_platform     BOOLEAN,
  platform_charity_id TEXT,
  rank               REAL,
  country            VARCHAR(2),
  registry_source    VARCHAR(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout TO '30s'
AS $$
DECLARE
  clean_query  TEXT;
  is_ein_query BOOLEAN := FALSE;
  tsq          tsquery;
BEGIN
  clean_query := trim(coalesce(search_query, ''));

  IF length(clean_query) >= 2 THEN
    -- Detect EIN-style queries (digits and hyphens only)
    is_ein_query := clean_query ~ '^[0-9\-]+$';
    IF NOT is_ein_query THEN
      tsq := plainto_tsquery('english', clean_query);
    END IF;
  END IF;

  IF is_ein_query THEN
    -- ── EIN lookup: uses btree index on ein ──────────────────────────────
    RETURN QUERY
    SELECT
      co.ein, co.name, co.city, co.state, co.zip, co.ntee_cd,
      co.deductibility, co.is_on_platform,
      co.platform_charity_id::TEXT,
      0.0::REAL AS rank,
      co.country, co.registry_source
    FROM charity_organizations co
    WHERE
      co.ein ILIKE clean_query || '%'
      AND (filter_state   IS NULL OR co.state    = filter_state)
      AND (filter_ntee    IS NULL OR co.ntee_cd  LIKE filter_ntee || '%')
      AND (filter_country IS NULL OR co.country  = filter_country)
    ORDER BY co.is_on_platform DESC, co.name ASC
    LIMIT  result_limit
    OFFSET result_offset;

  ELSIF tsq IS NOT NULL THEN
    -- ── Full-text search ─────────────────────────────────────────────────
    -- Primary path: GIN index on search_vector (fast).
    -- Fallback path: ILIKE on name when search_vector is NULL (covers rows
    -- that pre-date the backfill trigger or were imported without a vector).
    RETURN QUERY
    SELECT
      co.ein, co.name, co.city, co.state, co.zip, co.ntee_cd,
      co.deductibility, co.is_on_platform,
      co.platform_charity_id::TEXT,
      CASE
        WHEN co.search_vector IS NOT NULL
          THEN ts_rank_cd(co.search_vector, tsq)::REAL
        ELSE 0.0::REAL
      END AS rank,
      co.country, co.registry_source
    FROM charity_organizations co
    WHERE
      (
        (co.search_vector IS NOT NULL AND co.search_vector @@ tsq)
        OR
        (co.search_vector IS NULL AND co.name ILIKE '%' || clean_query || '%')
      )
      AND (filter_state   IS NULL OR co.state    = filter_state)
      AND (filter_ntee    IS NULL OR co.ntee_cd  LIKE filter_ntee || '%')
      AND (filter_country IS NULL OR co.country  = filter_country)
    ORDER BY co.is_on_platform DESC, rank DESC, co.name ASC
    LIMIT  result_limit
    OFFSET result_offset;

  ELSE
    -- ── Filter-only (no search term) ─────────────────────────────────────
    RETURN QUERY
    SELECT
      co.ein, co.name, co.city, co.state, co.zip, co.ntee_cd,
      co.deductibility, co.is_on_platform,
      co.platform_charity_id::TEXT,
      0.0::REAL AS rank,
      co.country, co.registry_source
    FROM charity_organizations co
    WHERE
      (filter_state   IS NULL OR co.state    = filter_state)
      AND (filter_ntee    IS NULL OR co.ntee_cd  LIKE filter_ntee || '%')
      AND (filter_country IS NULL OR co.country  = filter_country)
    ORDER BY co.is_on_platform DESC, co.name ASC
    LIMIT  result_limit
    OFFSET result_offset;
  END IF;
END;
$$;

COMMENT ON FUNCTION search_charity_organizations IS
  'Searches charity_organizations by full-text query, EIN, or geographic filters. '
  'SECURITY DEFINER to bypass RLS. '
  'Falls back to ILIKE when search_vector is NULL (protects against missing backfill). '
  'GIV-233: added EXECUTE grants, search_vector backfill guard, and ILIKE fallback.';
