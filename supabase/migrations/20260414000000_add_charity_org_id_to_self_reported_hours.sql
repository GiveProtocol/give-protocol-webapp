-- Migration: Add charity_org_id FK to self_reported_hours
-- Part of GIV-119: Add organization name autocomplete to self-reported hours form
-- Depends on GIV-118 (DB normalization trigger)
--
-- Changes:
--   1. Add uuid surrogate id to charity_organizations (if not already present)
--   2. Update search_charity_organizations RPC to return the id column
--   3. Add charity_org_id UUID FK on self_reported_hours -> charity_organizations(id)

-- =============================================================================
-- 1. Ensure charity_organizations has a UUID id column
-- =============================================================================

-- Add id column if it doesn't exist already.
-- DEFAULT gen_random_uuid() populates existing rows automatically.
ALTER TABLE charity_organizations
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- Backfill any rows that still have NULL (should be none with DEFAULT, but safe)
UPDATE charity_organizations
SET id = gen_random_uuid()
WHERE id IS NULL;

-- Enforce NOT NULL now that all rows have a value
ALTER TABLE charity_organizations
  ALTER COLUMN id SET NOT NULL;

-- Add unique constraint so we can use id as a FK target
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'charity_organizations_id_key'
      AND conrelid = 'charity_organizations'::regclass
  ) THEN
    ALTER TABLE charity_organizations
      ADD CONSTRAINT charity_organizations_id_key UNIQUE (id);
  END IF;
END $$;

-- =============================================================================
-- 2. Update search_charity_organizations RPC to return id
--    Must DROP first because the RETURNS TABLE signature changes.
-- =============================================================================

DROP FUNCTION IF EXISTS search_charity_organizations(TEXT, TEXT, TEXT, VARCHAR, INT, INT);

CREATE FUNCTION search_charity_organizations(
  search_query    TEXT        DEFAULT NULL,
  filter_state    TEXT        DEFAULT NULL,
  filter_ntee     TEXT        DEFAULT NULL,
  filter_country  VARCHAR(2)  DEFAULT NULL,
  result_limit    INT         DEFAULT 20,
  result_offset   INT         DEFAULT 0
)
RETURNS TABLE (
  id                UUID,
  ein               TEXT,
  name              TEXT,
  city              TEXT,
  state             TEXT,
  zip               TEXT,
  ntee_cd           TEXT,
  deductibility     TEXT,
  is_on_platform    BOOLEAN,
  platform_charity_id TEXT,
  rank              REAL,
  country           VARCHAR(2),
  registry_source   VARCHAR(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    co.id,
    co.ein,
    co.name,
    co.city,
    co.state,
    co.zip,
    co.ntee_cd,
    co.deductibility,
    co.is_on_platform,
    co.platform_charity_id::TEXT,
    CASE
      WHEN search_query IS NOT NULL AND length(trim(search_query)) >= 2 THEN
        ts_rank_cd(
          to_tsvector('english',
            coalesce(co.name, '') || ' ' ||
            coalesce(co.sort_name, '') || ' ' ||
            coalesce(co.ein, '')
          ),
          plainto_tsquery('english', search_query)
        )
      ELSE 0.0
    END::REAL AS rank,
    co.country,
    co.registry_source
  FROM charity_organizations co
  WHERE
    (
      search_query IS NULL
      OR length(trim(search_query)) < 2
      OR (
        to_tsvector('english',
          coalesce(co.name, '') || ' ' ||
          coalesce(co.sort_name, '') || ' ' ||
          coalesce(co.ein, '')
        ) @@ plainto_tsquery('english', search_query)
      )
      OR co.ein ILIKE search_query || '%'
      OR co.name ILIKE '%' || search_query || '%'
    )
    AND (filter_state   IS NULL OR co.state   = filter_state)
    AND (filter_ntee    IS NULL OR co.ntee_cd LIKE filter_ntee || '%')
    AND (filter_country IS NULL OR co.country = filter_country)
  ORDER BY
    co.is_on_platform DESC,
    rank DESC,
    co.name ASC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;

COMMENT ON FUNCTION search_charity_organizations(TEXT, TEXT, TEXT, VARCHAR, INT, INT) IS
  'Full-text search over the charity_organizations registry. '
  'Returns id UUID in addition to ein and other fields. '
  'Updated by GIV-119 to expose id for FK linking.';

-- =============================================================================
-- 3. Add charity_org_id FK column to self_reported_hours
-- =============================================================================

ALTER TABLE self_reported_hours
  ADD COLUMN IF NOT EXISTS charity_org_id UUID
    REFERENCES charity_organizations(id) ON DELETE SET NULL;

COMMENT ON COLUMN self_reported_hours.charity_org_id IS
  'FK to charity_organizations.id. Set when volunteer selects a registry org '
  'from the autocomplete. Enables deduplication across free-text org_name aliases. '
  'Added by GIV-119.';
