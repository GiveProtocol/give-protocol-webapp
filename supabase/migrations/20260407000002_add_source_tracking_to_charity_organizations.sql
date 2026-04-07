-- GIV-57: Add source tracking and sync metadata to charity_organizations registry
--
-- Problem: charity_organizations has no provenance or freshness tracking.
-- No data_source, data_vintage, or last_synced_at — impossible to know if a record is stale.
--
-- Solution: Add three columns and backfill from existing registry_source / country values.
-- data_source:   short token identifying the source registry (irs, sat_mexico, ccew_uk, cra_canada)
-- data_vintage:  publication date of the source dataset (NULL when unknown)
-- last_synced_at: timestamp of the most recent import/sync for this record
--
-- Pipeline note: future imports must set all three columns on INSERT/UPDATE.

-- 1. Add columns
ALTER TABLE charity_organizations
  ADD COLUMN IF NOT EXISTS data_source VARCHAR(50);

ALTER TABLE charity_organizations
  ADD COLUMN IF NOT EXISTS data_vintage DATE;

ALTER TABLE charity_organizations
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- 2. Backfill: US (IRS BMF) records
--    IRS Business Master File is published annually; the 2024 edition was the most recent
--    at the time the original data was imported.
UPDATE charity_organizations
SET
  data_source    = 'irs',
  data_vintage   = '2024-01-01',
  last_synced_at = NOW()
WHERE country = 'US';

-- 3. Backfill: Mexico (SAT) records
--    Mexico data was added in migration 20260401000000 with no vintage date documented.
UPDATE charity_organizations
SET
  data_source    = 'sat_mexico',
  data_vintage   = NULL,
  last_synced_at = NOW()
WHERE country = 'MX';

-- 4. Backfill any remaining rows not covered above (defensive catch-all)
UPDATE charity_organizations
SET
  data_source    = LOWER(REPLACE(COALESCE(registry_source, 'unknown'), ' ', '_')),
  data_vintage   = NULL,
  last_synced_at = NOW()
WHERE last_synced_at IS NULL;

-- 5. Indexes for freshness and source queries
CREATE INDEX IF NOT EXISTS idx_charity_organizations_data_source
  ON charity_organizations (data_source);

CREATE INDEX IF NOT EXISTS idx_charity_organizations_last_synced_at
  ON charity_organizations (last_synced_at);
