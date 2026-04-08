-- GIV-38: Add GIN index on search_vector and optimize search_charity_organizations RPC
-- The search_vector column is pre-populated but lacks a GIN index,
-- causing the RPC to compute to_tsvector on the fly for every row (slow on 1.69M rows).

-- 1. Create GIN index on search_vector for fast full-text search
CREATE INDEX IF NOT EXISTS idx_charity_organizations_search_vector
  ON charity_organizations USING gin (search_vector);

-- 2. Rewrite RPC to use pre-computed search_vector column
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
AS $$
DECLARE
  tsq tsquery;
BEGIN
  -- Parse query once outside the main SELECT
  IF search_query IS NOT NULL AND length(trim(search_query)) >= 2 THEN
    tsq := plainto_tsquery('english', search_query);
  END IF;

  RETURN QUERY
  SELECT
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
      WHEN tsq IS NOT NULL THEN ts_rank_cd(co.search_vector, tsq)
      ELSE 0.0
    END::REAL AS rank,
    co.country,
    co.registry_source
  FROM charity_organizations co
  WHERE
    -- Text search filter (optional)
    (
      tsq IS NULL
      OR co.search_vector @@ tsq
      OR co.ein ILIKE search_query || '%'
    )
    -- State filter (optional)
    AND (filter_state IS NULL OR co.state = filter_state)
    -- NTEE filter (optional)
    AND (filter_ntee IS NULL OR co.ntee_cd LIKE filter_ntee || '%')
    -- Country filter (optional, NULL = all countries)
    AND (filter_country IS NULL OR co.country = filter_country)
  ORDER BY
    co.is_on_platform DESC,
    rank DESC,
    co.name ASC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;
