-- Migration: Tighten wallet_aliases RLS to owner-only SELECT
-- Part of GIV-61: GDPR right-to-erasure implementation
-- Security fix: wallet address → user identity mapping must not be readable
-- by other authenticated users. Restricts SELECT to the owning user only.

-- Drop the overly broad authenticated SELECT policy
DROP POLICY IF EXISTS "wallet_aliases_authenticated_select" ON wallet_aliases;

-- Replace with owner-only SELECT
CREATE POLICY "wallet_aliases_owner_select" ON wallet_aliases
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

COMMENT ON POLICY "wallet_aliases_owner_select" ON wallet_aliases IS
  'Users may only read their own wallet aliases. '
  'Wallet address → user identity mapping is PII and must not be publicly readable.';
