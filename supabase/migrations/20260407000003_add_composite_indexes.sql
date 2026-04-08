-- disable_transaction
-- GIV-56: Add missing composite indexes for volunteer and donation queries
-- These indexes address full table scans on three high-traffic query patterns.
-- CONCURRENTLY requires disable_transaction so Supabase CLI does not wrap in BEGIN/COMMIT.

-- 1. self_reported_hours(volunteer_id, validation_status)
--    Used in every volunteer dashboard to filter a volunteer's hours by status.
--    Note: this index was created in 20251209000000_create_self_reported_hours.sql;
--    included here with IF NOT EXISTS as a safe no-op for completeness.
CREATE INDEX IF NOT EXISTS idx_self_reported_hours_volunteer_status
  ON self_reported_hours(volunteer_id, validation_status);

-- 2. fiat_donations(donor_id, created_at DESC)
--    Used in contribution aggregation queries that retrieve a donor's donation
--    history ordered by recency.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fiat_donations_donor_created
  ON fiat_donations(donor_id, created_at DESC);

-- 3. charity_organizations(country, ntee_cd)
--    Used in filtered charity browsing to narrow results by country and
--    NTEE category code simultaneously.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_charity_orgs_country_ntee
  ON charity_organizations(country, ntee_cd);
