-- GIV-118: Add normalization trigger for self_reported_hours.organization_name
-- Prevents duplicate org names caused by casing/whitespace variations
-- (e.g. "Red Cross" vs "red cross" vs "  Red Cross  ")

-- 1. Create trigger function to normalize organization_name on insert/update
CREATE OR REPLACE FUNCTION normalize_org_name()
RETURNS trigger AS $$
BEGIN
  NEW.organization_name := LOWER(TRIM(NEW.organization_name));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach trigger to self_reported_hours table
CREATE TRIGGER trg_normalize_org_name
BEFORE INSERT OR UPDATE ON self_reported_hours
FOR EACH ROW EXECUTE FUNCTION normalize_org_name();

-- 3. Backfill existing rows
UPDATE self_reported_hours
SET organization_name = LOWER(TRIM(organization_name))
WHERE organization_name IS NOT NULL;
