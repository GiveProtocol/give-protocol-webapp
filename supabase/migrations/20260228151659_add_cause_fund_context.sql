-- Add cause and fund context to checkout_sessions
-- so receipt data is captured at initialization time
ALTER TABLE checkout_sessions
  ADD COLUMN IF NOT EXISTS charity_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS cause_id uuid REFERENCES causes(id),
  ADD COLUMN IF NOT EXISTS fund_id uuid;
-- fund_id left without FK for now since CEF table
-- name needs verification

-- Add cause and fund context to fiat_donations
-- so accounting reports have full donation context
ALTER TABLE fiat_donations
  ADD COLUMN IF NOT EXISTS cause_id uuid REFERENCES causes(id),
  ADD COLUMN IF NOT EXISTS fund_id uuid,
  ADD COLUMN IF NOT EXISTS cause_name text,
  ADD COLUMN IF NOT EXISTS fund_name text;
-- Storing denormalized names as text in addition to IDs
-- so accounting reports are self-contained even if
-- cause/fund records change later

-- Add cause and fund context to fiat_subscriptions
ALTER TABLE fiat_subscriptions
  ADD COLUMN IF NOT EXISTS cause_id uuid REFERENCES causes(id),
  ADD COLUMN IF NOT EXISTS fund_id uuid,
  ADD COLUMN IF NOT EXISTS cause_name text,
  ADD COLUMN IF NOT EXISTS fund_name text;
