-- Migration: Admin donor management
-- Part of GIV-87: Implement admin donor management (list, detail, suspend/reinstate)
-- Depends on: GIV-84 audit trail infrastructure (20260411000001)

-- =============================================================================
-- 1. Add user_status column to profiles
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_status TEXT NOT NULL DEFAULT 'active'
  CHECK (user_status IN ('active', 'suspended', 'banned'));

COMMENT ON COLUMN profiles.user_status IS
  'Account status managed by admins. '
  'active=normal access, '
  'suspended=temporarily blocked from login, '
  'banned=permanently blocked.';

-- =============================================================================
-- 2. RLS policy: block non-admin reads of suspended/banned profiles
-- =============================================================================

-- Admins can read all profiles; other authenticated users can only read active ones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
      AND policyname = 'admin_read_all_profiles'
  ) THEN
    CREATE POLICY "admin_read_all_profiles" ON profiles
      FOR SELECT
      USING (
        auth.jwt() ->> 'user_type' = 'admin'
        OR auth.role() = 'service_role'
      );
  END IF;
END;
$$;

-- =============================================================================
-- 3. admin_list_donors — Paginated, filtered donor listing
-- =============================================================================

CREATE OR REPLACE FUNCTION admin_list_donors(
  p_status        TEXT        DEFAULT NULL,   -- filter by user_status ('active','suspended','banned')
  p_auth_method   TEXT        DEFAULT NULL,   -- filter by primary_auth_method ('email','wallet')
  p_search        TEXT        DEFAULT NULL,   -- search by email or wallet address
  p_date_from     TIMESTAMPTZ DEFAULT NULL,   -- filter by profile created_at
  p_date_to       TIMESTAMPTZ DEFAULT NULL,
  p_min_donated   NUMERIC     DEFAULT NULL,   -- filter by total donated (crypto + fiat USD)
  p_page          INT         DEFAULT 1,
  p_limit         INT         DEFAULT 50
)
RETURNS TABLE (
  user_id             UUID,
  email               TEXT,
  display_name        TEXT,
  wallet_address      TEXT,
  primary_auth_method TEXT,
  user_status         TEXT,
  total_crypto_usd    NUMERIC,
  total_fiat_usd      NUMERIC,
  donation_count      BIGINT,
  created_at          TIMESTAMPTZ,
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
  WITH donor_profiles AS (
    SELECT
      p.user_id,
      au.email,
      p.name                            AS display_name,
      ui.wallet_address,
      COALESCE(ui.primary_auth_method, 'email')::TEXT AS primary_auth_method,
      p.user_status,
      p.created_at
    FROM profiles p
    JOIN auth.users au ON au.id = p.user_id
    LEFT JOIN user_identities ui ON ui.user_id = p.user_id
    WHERE p.role = 'donor'
      AND (p_status      IS NULL OR p.user_status = p_status)
      AND (p_auth_method IS NULL OR COALESCE(ui.primary_auth_method, 'email') = p_auth_method)
      AND (p_date_from   IS NULL OR p.created_at >= p_date_from)
      AND (p_date_to     IS NULL OR p.created_at <= p_date_to)
      AND (p_search      IS NULL
           OR au.email ILIKE '%' || p_search || '%'
           OR ui.wallet_address ILIKE '%' || p_search || '%'
           OR p.name ILIKE '%' || p_search || '%')
  ),
  donation_totals AS (
    SELECT
      d.donor_id           AS uid,
      SUM(d.amount)::NUMERIC AS crypto_usd,
      COUNT(*)::BIGINT       AS crypto_count
    FROM donations d
    WHERE d.donor_id IS NOT NULL
    GROUP BY d.donor_id
  ),
  fiat_totals AS (
    SELECT
      fd.donor_id         AS uid,
      SUM(fd.amount_cents)::NUMERIC / 100 AS fiat_usd,
      COUNT(*)::BIGINT                     AS fiat_count
    FROM fiat_donations fd
    WHERE fd.donor_id IS NOT NULL
    GROUP BY fd.donor_id
  ),
  combined AS (
    SELECT
      dp.user_id,
      dp.email,
      dp.display_name,
      dp.wallet_address,
      dp.primary_auth_method,
      dp.user_status,
      COALESCE(dt.crypto_usd, 0)                        AS total_crypto_usd,
      COALESCE(ft.fiat_usd, 0)                          AS total_fiat_usd,
      COALESCE(dt.crypto_count, 0) + COALESCE(ft.fiat_count, 0) AS donation_count,
      dp.created_at
    FROM donor_profiles dp
    LEFT JOIN donation_totals dt ON dt.uid = dp.user_id
    LEFT JOIN fiat_totals     ft ON ft.uid = dp.user_id
    WHERE (p_min_donated IS NULL
           OR (COALESCE(dt.crypto_usd, 0) + COALESCE(ft.fiat_usd, 0)) >= p_min_donated)
  )
  SELECT
    c.user_id,
    c.email,
    c.display_name,
    c.wallet_address,
    c.primary_auth_method,
    c.user_status,
    c.total_crypto_usd,
    c.total_fiat_usd,
    c.donation_count,
    c.created_at,
    (SELECT COUNT(*) FROM combined)::BIGINT AS total_count
  FROM combined c
  ORDER BY c.created_at DESC
  LIMIT p_limit
  OFFSET v_offset;
END;
$$;

COMMENT ON FUNCTION admin_list_donors IS
  'Returns a paginated, filtered list of donor profiles with aggregated donation totals. '
  'Admin-only via JWT check. Part of GIV-87.';

-- =============================================================================
-- 4. admin_get_donor_detail — Full donor profile with history
-- =============================================================================

CREATE OR REPLACE FUNCTION admin_get_donor_detail(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Guard: only admin users can call this function
  IF (auth.jwt() ->> 'user_type') IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  SELECT jsonb_build_object(
    'profile', jsonb_build_object(
      'userId',           p.user_id,
      'email',            au.email,
      'displayName',      p.name,
      'userStatus',       p.user_status,
      'createdAt',        p.created_at
    ),
    'identity', jsonb_build_object(
      'walletAddress',     ui.wallet_address,
      'primaryAuthMethod', COALESCE(ui.primary_auth_method, 'email'),
      'walletLinkedAt',    ui.wallet_linked_at
    ),
    'donationSummary', jsonb_build_object(
      'cryptoDonationCount', COALESCE((SELECT COUNT(*) FROM donations d WHERE d.donor_id = p_user_id), 0),
      'cryptoTotalUsd',      COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.donor_id = p_user_id), 0),
      'fiatDonationCount',   COALESCE((SELECT COUNT(*) FROM fiat_donations fd WHERE fd.donor_id = p_user_id), 0),
      'fiatTotalUsd',        COALESCE((SELECT SUM(fd.amount_cents)::NUMERIC / 100 FROM fiat_donations fd WHERE fd.donor_id = p_user_id), 0)
    ),
    'recentCryptoDonations', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id',         d.id,
        'amount',     d.amount,
        'charityId',  d.charity_id,
        'createdAt',  d.created_at
      ) ORDER BY d.created_at DESC), '[]'::jsonb)
      FROM donations d
      WHERE d.donor_id = p_user_id
      LIMIT 10
    ),
    'recentFiatDonations', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id',          fd.id,
        'amountCents', fd.amount_cents,
        'currency',    fd.currency,
        'charityId',   fd.charity_id,
        'createdAt',   fd.created_at
      ) ORDER BY fd.created_at DESC), '[]'::jsonb)
      FROM fiat_donations fd
      WHERE fd.donor_id = p_user_id
      LIMIT 10
    ),
    'statusHistory', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id',             usa.id,
        'previousStatus', usa.previous_status,
        'newStatus',      usa.new_status,
        'reason',         usa.reason,
        'adminUserId',    usa.admin_user_id,
        'createdAt',      usa.created_at
      ) ORDER BY usa.created_at DESC), '[]'::jsonb)
      FROM user_status_audit usa
      WHERE usa.user_id = p_user_id
      LIMIT 20
    )
  )
  INTO v_result
  FROM profiles p
  JOIN auth.users au ON au.id = p.user_id
  LEFT JOIN user_identities ui ON ui.user_id = p.user_id
  WHERE p.user_id = p_user_id;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION admin_get_donor_detail IS
  'Returns a full JSONB snapshot of a donor profile including identity, donation history, '
  'and status change history. Admin-only via JWT check. Part of GIV-87.';

-- =============================================================================
-- 5. admin_update_user_status — Status transition with dual audit trail
-- =============================================================================

CREATE OR REPLACE FUNCTION admin_update_user_status(
  p_user_id   UUID,
  p_new_status TEXT,
  p_reason    TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id    UUID;
  v_prev_status TEXT;
  v_action_type TEXT;
  v_audit_id    UUID;
BEGIN
  -- Guard: only admin users can call this function
  IF (auth.jwt() ->> 'user_type') IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Validate new_status
  IF p_new_status NOT IN ('active', 'suspended', 'banned') THEN
    RAISE EXCEPTION 'Invalid status value: %. Must be one of: active, suspended, banned', p_new_status;
  END IF;

  v_admin_id := auth.uid();

  -- Get current status
  SELECT user_status INTO v_prev_status
  FROM profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Donor profile not found for user_id: %', p_user_id;
  END IF;

  IF v_prev_status IS NULL THEN
    v_prev_status := 'active';
  END IF;

  -- Determine action_type for audit log
  v_action_type := CASE p_new_status
    WHEN 'suspended' THEN 'user_suspend'
    WHEN 'banned'    THEN 'user_ban'
    WHEN 'active'    THEN 'user_reinstate'
    ELSE 'user_status_change'
  END;

  -- Update profiles.user_status
  UPDATE profiles
  SET user_status = p_new_status
  WHERE user_id = p_user_id;

  -- Insert into user_status_audit (specialized audit table)
  INSERT INTO user_status_audit (
    user_id, previous_status, new_status, reason, admin_user_id
  )
  VALUES (
    p_user_id, v_prev_status, p_new_status, p_reason, v_admin_id
  )
  RETURNING id INTO v_audit_id;

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
    'user',
    p_user_id,
    jsonb_build_object('status', v_prev_status),
    jsonb_build_object('status', p_new_status, 'reason', p_reason)
  );

  RETURN v_audit_id;
END;
$$;

COMMENT ON FUNCTION admin_update_user_status IS
  'Updates a donor user_status on profiles and atomically writes to both user_status_audit '
  'and admin_audit_log. Valid statuses: active, suspended, banned. '
  'Admin-only via JWT check. Part of GIV-87.';

-- =============================================================================
-- 6. RLS policy: wallet-auth must check user_status (belt-and-suspenders)
--    Actual enforcement is in the wallet-auth edge function, but we also
--    prevent suspended/banned users from selecting their own profile via RLS.
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
      AND policyname = 'active_users_read_own_profile'
  ) THEN
    CREATE POLICY "active_users_read_own_profile" ON profiles
      FOR SELECT
      USING (
        auth.uid() = user_id
        AND user_status = 'active'
      );
  END IF;
END;
$$;
