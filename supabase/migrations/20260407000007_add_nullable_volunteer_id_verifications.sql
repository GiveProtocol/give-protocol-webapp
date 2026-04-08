-- Migration: Allow NULL on volunteer_verifications.volunteer_id
-- Part of GIV-61: GDPR right-to-erasure implementation
-- Verification records are on-chain audit trail and must not be deleted.
-- When a user exercises erasure, volunteer_id is set to NULL to sever identity
-- linkage while retaining blockchain references for regulatory compliance.

ALTER TABLE volunteer_verifications
  ALTER COLUMN volunteer_id DROP NOT NULL;

COMMENT ON COLUMN volunteer_verifications.volunteer_id IS
  'Reference to the volunteer. Set to NULL when user exercises GDPR right to erasure; '
  'the verification record is retained for blockchain audit trail purposes (GDPR Art. 17(3)(b)).';
