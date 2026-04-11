-- Migration: Admin charity management RPC functions
-- Part of GIV-86: Build admin charity management workflow (approve/reject/suspend/reinstate)
-- Depends on: GIV-84 audit trail infrastructure (20260411000001)

-- =============================================================================
-- 1. Extend charity_verifications to support 'suspended' and 'verified' statuses
-- =============================================================================

-- Add 'suspended' and 'verified' as valid status values if a check constraint exists.
-- We drop and recreate the constraint to add the new values.
-- If no constraint exists, the ALTER is a no-op.
DO $$
BEGIN
  -- Drop existing check constraint on charity_verifications.status if present
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'charity_verifications'
      AND constraint_type = 'CHECK'
      AND constraint_name LIKE '%status%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE charity_verifications DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'charity_verifications'
        AND constraint_type = 'CHECK'
        AND constraint_name LIKE '%status%'
      LIMIT 1
    );
  END IF;

  -- Add new check constraint that includes all valid statuses
  ALTER TABLE charity_verifications
    ADD CONSTRAINT charity_verifications_status_check
    CHECK (status IN ('pending', 'approved', 'verified', 'rejected', 'suspended'));
END;
$$;

COMMENT ON COLUMN charity_verifications.status IS
  'Verification workflow status. '
  'pending=awaiting admin review, '
  'approved/verified=admin approved, '
  'rejected=admin rejected, '
  'suspended=admin suspended after prior approval.';

-- =============================================================================
-- 2. admin_list_charities — Paginated, filtered charity listing for admin
-- =============================================================================
CREATE OR REPLACE FUNCTION admin_list_charities(
  p_status        TEXT        DEFAULT NULL,   -- filter by verification status
  p_category      TEXT        DEFAULT NULL,   -- filter by charity category (profiles.meta->>'category')
  p_search        TEXT        DEFAULT NULL,   -- search by name (profiles.name)
  p_page          INT         DEFAULT 1,
  p_limit         INT         DEFAULT 50
)
RETURNS TABLE (
  id                  UUID,
  user_id             UUID,
  name                TEXT,
  category            TEXT,
  logo_url            TEXT,
  mission             TEXT,
  verification_id     UUID,
  verification_status TEXT,
  review_notes        TEXT,
  reviewed_at         TIMESTAMPTZ,
  wallet_address      TEXT,
  created_at          TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ,
  total_count         BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset INT;
BEGIN
  -- Guard: only admin users can call this function
  IF (auth.jwt() ->> 'user_type') IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Clamp pagination
  IF p_page < 1 THEN p_page := 1; END IF;
  IF p_limit < 1 OR p_limit > 200 THEN p_limit := 50; END IF;
  v_offset := (p_page - 1) * p_limit;

  RETURN QUERY
  WITH filtered AS (
    SELECT
      p.id,
      p.user_id,
      p.name,
      (p.meta ->> 'category')::TEXT              AS category,
      (p.meta ->> 'logoUrl')::TEXT               AS logo_url,
      (p.meta ->> 'mission')::TEXT               AS mission,
      cv.id                                       AS verification_id,
      COALESCE(cv.status, 'pending')::TEXT        AS verification_status,
      cv.review_notes,
      cv.reviewed_at,
      (p.meta ->> 'walletAddress')::TEXT          AS wallet_address,
      p.created_at,
      p.updated_at
    FROM profiles p
    LEFT JOIN charity_verifications cv ON cv.charity_id = p.id
    WHERE p.type = 'charity'
      AND (p_status  IS NULL OR COALESCE(cv.status, 'pending') = p_status)
      AND (p_category IS NULL OR (p.meta ->> 'category') = p_category)
      AND (p_search   IS NULL OR p.name ILIKE '%' || p_search || '%')
  )
  SELECT
    f.id,
    f.user_id,
    f.name,
    f.category,
    f.logo_url,
    f.mission,
    f.verification_id,
    f.verification_status,
    f.review_notes,
    f.reviewed_at,
    f.wallet_address,
    f.created_at,
    f.updated_at,
    (SELECT COUNT(*) FROM filtered)::BIGINT AS total_count
  FROM filtered f
  ORDER BY
    CASE f.verification_status
      WHEN 'pending'  THEN 1
      WHEN 'verified' THEN 2
      WHEN 'approved' THEN 2
      WHEN 'suspended' THEN 3
      WHEN 'rejected' THEN 4
      ELSE 5
    END,
    f.created_at DESC
  LIMIT p_limit
  OFFSET v_offset;
END;
$$;

COMMENT ON FUNCTION admin_list_charities IS
  'Returns a paginated, filtered list of all charity profiles with their verification status. '
  'Pending charities are sorted first. Admin-only via JWT check. Part of GIV-86.';

-- =============================================================================
-- 3. admin_update_charity_status — Status transition with dual audit trail
-- =============================================================================
CREATE OR REPLACE FUNCTION admin_update_charity_status(
  p_charity_id  UUID,
  p_new_status  TEXT,
  p_reason      TEXT  DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id        UUID;
  v_prev_status     TEXT;
  v_verification_id UUID;
  v_action_type     TEXT;
BEGIN
  -- Guard: only admin users can call this function
  IF (auth.jwt() ->> 'user_type') IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Validate new_status
  IF p_new_status NOT IN ('pending', 'verified', 'approved', 'rejected', 'suspended') THEN
    RAISE EXCEPTION 'Invalid status value: %. Must be one of: pending, verified, approved, rejected, suspended', p_new_status;
  END IF;

  v_admin_id := auth.uid();

  -- Get current verification row (or treat as pending if none)
  SELECT id, status
  INTO v_verification_id, v_prev_status
  FROM charity_verifications
  WHERE charity_id = p_charity_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_prev_status IS NULL THEN
    v_prev_status := 'pending';
  END IF;

  -- Determine action_type for audit log
  v_action_type := CASE p_new_status
    WHEN 'verified'   THEN 'verification_approve'
    WHEN 'approved'   THEN 'verification_approve'
    WHEN 'rejected'   THEN 'verification_reject'
    WHEN 'suspended'  THEN 'charity_suspend'
    WHEN 'pending'    THEN 'charity_reinstate'
    ELSE 'charity_status_change'
  END;

  -- Upsert charity_verifications
  IF v_verification_id IS NOT NULL THEN
    UPDATE charity_verifications
    SET
      status      = p_new_status,
      review_notes = p_reason,
      reviewed_at  = NOW()
    WHERE id = v_verification_id;
  ELSE
    INSERT INTO charity_verifications (charity_id, status, review_notes, reviewed_at)
    VALUES (p_charity_id, p_new_status, p_reason, NOW())
    RETURNING id INTO v_verification_id;
  END IF;

  -- Insert into charity_status_audit (specialized audit table)
  INSERT INTO charity_status_audit (
    charity_id, previous_status, new_status, reason, admin_user_id
  )
  VALUES (
    p_charity_id, v_prev_status, p_new_status, p_reason, v_admin_id
  );

  -- Insert into master admin_audit_log
  INSERT INTO admin_audit_log (
    admin_user_id,
    action_type,
    entity_type,
    entity_id,
    old_values,
    new_values
  )
  VALUES (
    v_admin_id,
    v_action_type,
    'charity',
    p_charity_id,
    jsonb_build_object('status', v_prev_status),
    jsonb_build_object('status', p_new_status, 'reason', p_reason)
  );

  RETURN v_verification_id;
END;
$$;

COMMENT ON FUNCTION admin_update_charity_status IS
  'Updates a charity verification status and atomically writes to both charity_status_audit '
  'and admin_audit_log. Valid statuses: pending, verified, approved, rejected, suspended. '
  'Admin-only via JWT check. Part of GIV-86.';

-- =============================================================================
-- 4. RLS policies for admin_list_charities and admin_update_charity_status
--    (functions are SECURITY DEFINER, so they bypass RLS — policies here are
--     belt-and-suspenders for direct table access by admin users)
-- =============================================================================

-- Ensure admins can SELECT from charity_verifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'charity_verifications'
      AND policyname = 'admin_read_charity_verifications'
  ) THEN
    CREATE POLICY "admin_read_charity_verifications" ON charity_verifications
      FOR SELECT
      USING (
        auth.jwt() ->> 'user_type' = 'admin'
        OR auth.role() = 'service_role'
      );
  END IF;
END;
$$;

-- Ensure admins can UPDATE charity_verifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'charity_verifications'
      AND policyname = 'admin_update_charity_verifications'
  ) THEN
    CREATE POLICY "admin_update_charity_verifications" ON charity_verifications
      FOR UPDATE
      USING (
        auth.jwt() ->> 'user_type' = 'admin'
        OR auth.role() = 'service_role'
      );
  END IF;
END;
$$;

-- Ensure admins can INSERT into charity_verifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'charity_verifications'
      AND policyname = 'admin_insert_charity_verifications'
  ) THEN
    CREATE POLICY "admin_insert_charity_verifications" ON charity_verifications
      FOR INSERT
      WITH CHECK (
        auth.jwt() ->> 'user_type' = 'admin'
        OR auth.role() = 'service_role'
      );
  END IF;
END;
$$;
