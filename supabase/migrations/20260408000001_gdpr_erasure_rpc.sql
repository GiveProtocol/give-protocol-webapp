-- Migration: GDPR erasure RPC and pg_cron schedule
-- Part of GIV-63: Implement nightly GDPR erasure cron Edge Function
--
-- Creates:
--   execute_gdpr_erasure(p_user_id, p_user_email) — atomic Steps 2–9
--   pg_cron job — calls gdpr-erasure-cron Edge Function nightly at 02:00 UTC

-- ─── 1. Transactional erasure RPC (Steps 2–9) ────────────────────────────────
-- Wraps all SQL-layer PII erasure in a single transaction so that a partial
-- failure leaves the database consistent. Called by the Edge Function.

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
  'Called by the gdpr-erasure-cron Edge Function. Steps 1, 10, and 11 are '
  'handled externally by the Edge Function.';

-- Restrict execution to service_role only
REVOKE ALL ON FUNCTION execute_gdpr_erasure(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION execute_gdpr_erasure(UUID, TEXT) TO service_role;


-- ─── 2. pg_cron: nightly erasure schedule ────────────────────────────────────
-- Runs at 02:00 UTC every day.
-- Calls the gdpr-erasure-cron Edge Function via pg_net HTTP request.
-- Requires the pg_cron and pg_net extensions.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job (idempotent: unschedule first if it exists)
SELECT cron.unschedule('gdpr-erasure-nightly')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'gdpr-erasure-nightly'
);

SELECT cron.schedule(
  'gdpr-erasure-nightly',
  '0 2 * * *',   -- 02:00 UTC daily
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_functions_url') || '/gdpr-erasure-cron',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);

COMMENT ON EXTENSION pg_cron IS
  'Enables scheduled PostgreSQL jobs. Used for nightly GDPR erasure cron.';
