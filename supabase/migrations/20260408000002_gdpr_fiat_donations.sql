-- Migration: GDPR coverage for fiat_donations table
-- Part of GIV-64: Update GDPR data map — add fiat_donations to export and erasure spec
--
-- 1. Makes donor_id NULLable so the FK can be severed during GDPR erasure
--    without deleting the financial transaction record.
--    Financial records must be retained for accounting/PCI compliance
--    (GDPR Art. 17(3)(b) legal obligation basis).
--
-- 2. Replaces execute_gdpr_erasure to add Step 5b: anonymize fiat_donations.
--    This preserves the transaction record while removing the donor's PII and
--    severing the link between the financial record and the now-deleted user.
--
-- Erasure decision for fiat_donations:
--   - RETAIN:   amount_cents, currency, charity_id, payment_method, card_type,
--               card_last_four (last 4 digits are not restricted PAN per PCI DSS v4.0,
--               see GIV-55 findings), cause_id, fund_id, cause_name, fund_name,
--               transaction_id, created_at — all needed for accounting and charity
--               disbursement records.
--   - ANONYMIZE: donor_name, donor_email, donor_address — personal identity data
--   - SET NULL:  donor_id — FK link to auth.users; severs identity association

-- ─── 1. Make donor_id NULLable ───────────────────────────────────────────────

ALTER TABLE fiat_donations
  ALTER COLUMN donor_id DROP NOT NULL;

COMMENT ON COLUMN fiat_donations.donor_id IS
  'FK to auth.users. Nullable to support GDPR erasure: set to NULL during '
  'erasure to sever the identity link while retaining the financial '
  'transaction record for accounting compliance.';

-- ─── 2. Update execute_gdpr_erasure RPC (add Step 5b: fiat_donations) ────────

CREATE OR REPLACE FUNCTION execute_gdpr_erasure(
  p_user_id    UUID,
  p_user_email TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- ── Step 2: Anonymize volunteer_applications PII fields ──────────────────
  UPDATE volunteer_applications
  SET
    full_name = '[deleted]',
    email     = '[deleted]',
    phone     = NULL,
    location  = NULL,
    age_range = NULL,
    message   = NULL
  WHERE applicant_id = p_user_id;

  -- ── Step 3: Anonymize charity_profile authorized signer fields ───────────
  UPDATE charity_profile
  SET
    authorized_signer_name  = '[deleted]',
    authorized_signer_email = '[deleted]',
    authorized_signer_phone = NULL,
    claimed_by              = NULL
  WHERE claimed_by = p_user_id;

  -- ── Step 4: Anonymize charity_nominations.nominator_email ────────────────
  -- Match by email address since nominator_email is not a FK to auth.users
  UPDATE charity_nominations
  SET nominator_email = '[deleted]'
  WHERE nominator_email = p_user_email;

  -- ── Step 5: Set volunteer_verifications.volunteer_id = NULL ──────────────
  -- Verifications are part of on-chain audit trail; rows must be preserved.
  UPDATE volunteer_verifications
  SET volunteer_id = NULL
  WHERE volunteer_id = p_user_id;

  -- ── Step 5b: Anonymize fiat_donations PII and sever donor_id FK ──────────
  -- Financial transaction records are retained for accounting compliance
  -- (GDPR Art. 17(3)(b) legal obligation basis).
  -- PII fields are anonymized; donor_id is set to NULL to sever identity link.
  UPDATE fiat_donations
  SET
    donor_name    = '[deleted]',
    donor_email   = '[deleted]',
    donor_address = NULL,
    donor_id      = NULL
  WHERE donor_id = p_user_id;

  -- ── Step 6: Hard delete wallet_aliases ───────────────────────────────────
  DELETE FROM wallet_aliases
  WHERE user_id = p_user_id;

  -- ── Step 7: Hard delete user_identities ──────────────────────────────────
  DELETE FROM user_identities
  WHERE user_id = p_user_id;

  -- ── Step 8: Hard delete user_preferences ─────────────────────────────────
  DELETE FROM user_preferences
  WHERE user_id = p_user_id;

  -- ── Step 9: Hard delete profiles ─────────────────────────────────────────
  -- This triggers no cascades; auth.users deletion (Step 10) handles the rest.
  DELETE FROM profiles
  WHERE user_id = p_user_id;
END;
$$;

COMMENT ON FUNCTION execute_gdpr_erasure(UUID, TEXT) IS
  'Executes GDPR erasure Steps 2–9 atomically in a transaction. '
  'Step 5b anonymizes fiat_donations PII and severs the donor_id FK link. '
  'Financial transaction records are retained per accounting/legal requirements. '
  'Called by the gdpr-erasure-cron Edge Function. Steps 1, 10, and 11 are '
  'handled externally by the Edge Function.';

-- Restrict execution to service_role only
REVOKE ALL ON FUNCTION execute_gdpr_erasure(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION execute_gdpr_erasure(UUID, TEXT) TO service_role;
