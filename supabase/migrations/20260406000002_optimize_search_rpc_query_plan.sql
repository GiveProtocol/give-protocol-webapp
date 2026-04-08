-- GIV-38: Fix search_charity_organizations query plan to use GIN index
-- The OR (search_vector @@ tsq OR ein ILIKE ...) forces a full sequential scan
-- even with a GIN index on search_vector.
-- Solution: split EIN lookups from full-text search via separate code paths.

CREATE OR REPLACE FUNCTION search_charity_organizations(
  search_query TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_ntee TEXT DEFAULT NULL,
  filter_country VARCHAR(2) DEFAULT NULL,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  ein TEXT,
  name TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  ntee_cd TEXT,
  deductibility TEXT,
  is_on_platform BOOLEAN,
  platform_charity_id TEXT,
  rank REAL,
  country VARCHAR(2),
  registry_source VARCHAR(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout TO '30s'
AS $$
DECLARE
  clean_query TEXT;
  is_ein_query BOOLEAN := FALSE;
  tsq tsquery;
BEGIN
  clean_query := trim(coalesce(search_query, ''));

  IF length(clean_query) >= 2 THEN
    -- Check if this looks like an EIN (only digits and dashes)
    is_ein_query := clean_query ~ '^[0-9\-]+$';
    IF NOT is_ein_query THEN
      tsq := plainto_tsquery('english', clean_query);
    END IF;
  END IF;

  IF is_ein_query THEN
    -- EIN lookup: uses the btree index on (ein, country) or primary key on ein
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
      AND (filter_state IS NULL OR co.state = filter_state)
      AND (filter_ntee IS NULL OR co.ntee_cd LIKE filter_ntee || '%')
      AND (filter_country IS NULL OR co.country = filter_country)
    ORDER BY co.is_on_platform DESC, co.name ASC
    LIMIT result_limit
    OFFSET result_offset;

  ELSIF tsq IS NOT NULL THEN
    -- Full-text search: uses GIN index on search_vector
    RETURN QUERY
    SELECT
      co.ein, co.name, co.city, co.state, co.zip, co.ntee_cd,
      co.deductibility, co.is_on_platform,
      co.platform_charity_id::TEXT,
      ts_rank_cd(co.search_vector, tsq)::REAL AS rank,
      co.country, co.registry_source
    FROM charity_organizations co
    WHERE
      co.search_vector @@ tsq
      AND (filter_state IS NULL OR co.state = filter_state)
      AND (filter_ntee IS NULL OR co.ntee_cd LIKE filter_ntee || '%')
      AND (filter_country IS NULL OR co.country = filter_country)
    ORDER BY co.is_on_platform DESC, rank DESC, co.name ASC
    LIMIT result_limit
    OFFSET result_offset;

  ELSE
    -- Filter-only (no search query): return top results by name within filters
    RETURN QUERY
    SELECT
      co.ein, co.name, co.city, co.state, co.zip, co.ntee_cd,
      co.deductibility, co.is_on_platform,
      co.platform_charity_id::TEXT,
      0.0::REAL AS rank,
      co.country, co.registry_source
    FROM charity_organizations co
    WHERE
      (filter_state IS NULL OR co.state = filter_state)
      AND (filter_ntee IS NULL OR co.ntee_cd LIKE filter_ntee || '%')
      AND (filter_country IS NULL OR co.country = filter_country)
    ORDER BY co.is_on_platform DESC, co.name ASC
    LIMIT result_limit
    OFFSET result_offset;
  END IF;
END;
$$;
