-- Migration: Add encrypted PII columns to volunteer_applications
-- Part of GIV-59: Implement encryption-at-rest for PII fields
-- Step 1 of 2: Add shadow encrypted columns (originals kept during 30-day hold)

ALTER TABLE volunteer_applications
  ADD COLUMN IF NOT EXISTS full_name_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS email_encrypted      TEXT,
  ADD COLUMN IF NOT EXISTS email_hmac           TEXT,
  ADD COLUMN IF NOT EXISTS phone_encrypted      TEXT;

COMMENT ON COLUMN volunteer_applications.full_name_encrypted IS
  'AES-256-GCM application-layer encrypted full name. Format: v{key_version}:<base64_iv>:<base64_ciphertext>';
COMMENT ON COLUMN volunteer_applications.email_encrypted IS
  'AES-256-GCM application-layer encrypted email. Format: v{key_version}:<base64_iv>:<base64_ciphertext>';
COMMENT ON COLUMN volunteer_applications.email_hmac IS
  'HMAC-SHA256 blind index of email for equality lookups. Never decryptable to original.';
COMMENT ON COLUMN volunteer_applications.phone_encrypted IS
  'AES-256-GCM application-layer encrypted phone. Format: v{key_version}:<base64_iv>:<base64_ciphertext>';

-- Index for email equality lookups via blind index
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_email_hmac
  ON volunteer_applications (email_hmac)
  WHERE email_hmac IS NOT NULL;
