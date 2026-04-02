-- GIV-25 Phase 1: Extend irs_organizations schema for multi-country support
-- Adds country, registry_source, email, and phone columns to support Mexico data

-- Add country column (ISO 3166-1 alpha-2 code)
ALTER TABLE irs_organizations
  ADD COLUMN IF NOT EXISTS country VARCHAR(2) NOT NULL DEFAULT 'US';

-- Add registry source to track data origin
ALTER TABLE irs_organizations
  ADD COLUMN IF NOT EXISTS registry_source VARCHAR(50) NOT NULL DEFAULT 'IRS_BMF';

-- Add contact fields used by Mexico registry
ALTER TABLE irs_organizations
  ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE irs_organizations
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Backfill existing US records explicitly
UPDATE irs_organizations
SET country = 'US', registry_source = 'IRS_BMF'
WHERE country = 'US' AND registry_source = 'IRS_BMF';

-- Index on country for filtered search performance
CREATE INDEX IF NOT EXISTS idx_irs_organizations_country
  ON irs_organizations (country);

-- Composite index for country + name search
CREATE INDEX IF NOT EXISTS idx_irs_organizations_country_sort_name
  ON irs_organizations (country, sort_name);

-- Drop old unique constraint on ein and recreate with country
-- (RFC and EIN formats don't collide, but future-proofing for multi-country)
DO $$
BEGIN
  -- Check if the old constraint exists before dropping
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'irs_organizations_ein_key'
    AND conrelid = 'irs_organizations'::regclass
  ) THEN
    ALTER TABLE irs_organizations DROP CONSTRAINT irs_organizations_ein_key;
  END IF;

  -- Create new unique constraint including country
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'irs_organizations_ein_country_key'
    AND conrelid = 'irs_organizations'::regclass
  ) THEN
    ALTER TABLE irs_organizations ADD CONSTRAINT irs_organizations_ein_country_key UNIQUE (ein, country);
  END IF;
END $$;
