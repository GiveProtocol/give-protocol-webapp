-- GIV-28 Phase 2: Rename irs_organizations → charity_organizations
-- The table now holds charities from multiple countries (US, MX, and future),
-- so the IRS-centric name is misleading.

-- 1. Rename the table
ALTER TABLE irs_organizations RENAME TO charity_organizations;

-- 2. Rename indexes
ALTER INDEX IF EXISTS idx_irs_organizations_country
  RENAME TO idx_charity_organizations_country;

ALTER INDEX IF EXISTS idx_irs_organizations_country_sort_name
  RENAME TO idx_charity_organizations_country_sort_name;

-- 3. Rename constraints
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'irs_organizations_ein_country_key'
  ) THEN
    ALTER TABLE charity_organizations
      RENAME CONSTRAINT irs_organizations_ein_country_key
      TO charity_organizations_ein_country_key;
  END IF;
END $$;

-- 4. Replace the RPC function with the new name pointing to charity_organizations
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
BEGIN
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
    co.platform_charity_id,
    CASE
      WHEN search_query IS NOT NULL AND length(trim(search_query)) >= 2 THEN
        ts_rank_cd(
          to_tsvector('english', coalesce(co.name, '') || ' ' || coalesce(co.sort_name, '') || ' ' || coalesce(co.ein, '')),
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
        to_tsvector('english', coalesce(co.name, '') || ' ' || coalesce(co.sort_name, '') || ' ' || coalesce(co.ein, ''))
        @@ plainto_tsquery('english', search_query)
      )
      OR co.ein ILIKE search_query || '%'
      OR co.name ILIKE '%' || search_query || '%'
    )
    AND (filter_state IS NULL OR co.state = filter_state)
    AND (filter_ntee IS NULL OR co.ntee_cd LIKE filter_ntee || '%')
    AND (filter_country IS NULL OR co.country = filter_country)
  ORDER BY
    co.is_on_platform DESC,
    rank DESC,
    co.name ASC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;

-- 5. Drop the old RPC function
DROP FUNCTION IF EXISTS search_irs_organizations(TEXT, TEXT, TEXT, VARCHAR, INT, INT);
