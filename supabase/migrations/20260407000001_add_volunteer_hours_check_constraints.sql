-- Add DB-level CHECK constraints for volunteer hours validation (GIV-53)
--
-- Problem: TypeScript validation enforces hours ranges and date rules, but edge functions
-- or direct DB access could bypass the app layer and insert invalid data.
--
-- self_reported_hours: already has equivalent constraints (valid_hours, valid_activity_date)
-- from migration 20251209000000. This migration adds the standardized names requested in
-- GIV-53 using idempotency guards to avoid errors on databases where they already exist.
--
-- volunteer_hours: only has an unnamed inline CHECK (hours > 0). This migration adds a
-- named constraint enforcing both the 0.5 minimum and 24 maximum to close that gap.
--
-- TS constants: MIN_HOURS_PER_RECORD = 0.5, MAX_HOURS_PER_RECORD = 24

-- self_reported_hours: add standardized named constraint for hours range
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_hours_range'
      AND conrelid = 'self_reported_hours'::regclass
  ) THEN
    ALTER TABLE self_reported_hours
      ADD CONSTRAINT chk_hours_range CHECK (hours >= 0.5 AND hours <= 24);
  END IF;
END $$;

-- self_reported_hours: add standardized named constraint for activity date
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_activity_date_not_future'
      AND conrelid = 'self_reported_hours'::regclass
  ) THEN
    ALTER TABLE self_reported_hours
      ADD CONSTRAINT chk_activity_date_not_future CHECK (activity_date <= CURRENT_DATE);
  END IF;
END $$;

-- volunteer_hours: add named range constraint
-- The existing unnamed inline CHECK (hours > 0) allows any positive value with no upper
-- bound and no 0.5 minimum. This constraint closes that gap.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_volunteer_hours_range'
      AND conrelid = 'volunteer_hours'::regclass
  ) THEN
    ALTER TABLE volunteer_hours
      ADD CONSTRAINT chk_volunteer_hours_range CHECK (hours >= 0.5 AND hours <= 24);
  END IF;
END $$;
