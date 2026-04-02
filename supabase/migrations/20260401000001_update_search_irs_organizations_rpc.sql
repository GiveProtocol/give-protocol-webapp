-- GIV-25 Phase 2: Update search_irs_organizations RPC for multi-country filtering
-- Adds optional filter_country parameter; backward compatible (NULL = all countries)

CREATE OR REPLACE FUNCTION search_irs_organizations(
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
BEGIN
  RETURN QUERY
  SELECT
    io.ein,
    io.name,
    io.city,
    io.state,
    io.zip,
    io.ntee_cd,
    io.deductibility,
    io.is_on_platform,
    io.platform_charity_id,
    CASE
      WHEN search_query IS NOT NULL AND length(trim(search_query)) >= 2 THEN
        ts_rank_cd(
          to_tsvector('english', coalesce(io.name, '') || ' ' || coalesce(io.sort_name, '') || ' ' || coalesce(io.ein, '')),
          plainto_tsquery('english', search_query)
        )
      ELSE 0.0
    END::REAL AS rank,
    io.country,
    io.registry_source
  FROM irs_organizations io
  WHERE
    -- Text search filter (optional)
    (
      search_query IS NULL
      OR length(trim(search_query)) < 2
      OR (
        to_tsvector('english', coalesce(io.name, '') || ' ' || coalesce(io.sort_name, '') || ' ' || coalesce(io.ein, ''))
        @@ plainto_tsquery('english', search_query)
      )
      OR io.ein ILIKE search_query || '%'
      OR io.name ILIKE '%' || search_query || '%'
    )
    -- State filter (optional)
    AND (filter_state IS NULL OR io.state = filter_state)
    -- NTEE filter (optional)
    AND (filter_ntee IS NULL OR io.ntee_cd LIKE filter_ntee || '%')
    -- Country filter (optional, NULL = all countries)
    AND (filter_country IS NULL OR io.country = filter_country)
  ORDER BY
    io.is_on_platform DESC,
    rank DESC,
    io.name ASC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;
