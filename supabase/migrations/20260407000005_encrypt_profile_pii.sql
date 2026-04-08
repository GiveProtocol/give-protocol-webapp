-- Migration: Add encrypted PII column to profiles
-- Part of GIV-59: Implement encryption-at-rest for PII fields
-- Step 1 of 2: Add pii_encrypted column (meta.contact/address kept during 30-day hold)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pii_encrypted TEXT;

COMMENT ON COLUMN profiles.pii_encrypted IS
  'AES-256-GCM application-layer encrypted JSON blob. Decrypted shape: {"contact":{"email","phone"},"address":{"street","city","stateProvince","postalCode","country"}}';
