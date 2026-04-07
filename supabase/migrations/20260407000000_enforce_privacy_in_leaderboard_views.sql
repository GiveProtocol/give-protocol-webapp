-- Migration: Enforce privacy settings in leaderboard and public-facing queries
-- Related: GIV-52
--
-- Creates a helper function that checks whether a user allows public visibility
-- for a given privacy field. This is used by RLS policies and application-level
-- queries to respect user_preferences.privacy_settings.
--
-- Privacy logic:
--   A user is PUBLIC if they have no user_preferences row (opt-in privacy),
--   OR their privacy_settings.publicProfile is not explicitly false,
--   AND the specific field (e.g., showDonations) is not explicitly false.

-- Helper function: checks if a user allows public visibility for a specific field
CREATE OR REPLACE FUNCTION public.user_allows_public_visibility(
  p_user_id uuid,
  p_field text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (
      SELECT
        -- User is visible if publicProfile is not false AND the specific field is not false
        COALESCE((up.privacy_settings->>'publicProfile')::boolean, true)
        AND COALESCE((up.privacy_settings->>p_field)::boolean, true)
      FROM user_preferences up
      WHERE up.user_id = p_user_id
      LIMIT 1
    ),
    true  -- No preferences row = default public
  );
$$;

-- Grant execute to authenticated users (needed for RLS policy evaluation)
GRANT EXECUTE ON FUNCTION public.user_allows_public_visibility(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_allows_public_visibility(uuid, text) TO anon;

-- Add RLS policy for donations: allow reading other users' donations only if they allow it
-- (existing policy allows donors to see own + charities to see received; this adds public access)
DROP POLICY IF EXISTS "Public can view donations from public users" ON donations;
CREATE POLICY "Public can view donations from public users" ON donations
  FOR SELECT
  USING (
    -- Own donations are always visible
    (SELECT auth.uid()) = donor_id
    -- Charity can see donations to them
    OR (SELECT auth.uid()) = charity_id
    -- Public visibility check for leaderboard/aggregate queries
    OR public.user_allows_public_visibility(donor_id, 'showDonations')
  );

-- Add RLS policy for fiat_donations
DROP POLICY IF EXISTS "Public can view fiat donations from public users" ON fiat_donations;
CREATE POLICY "Public can view fiat donations from public users" ON fiat_donations
  FOR SELECT
  USING (
    (SELECT auth.uid()) = donor_id
    OR (SELECT auth.uid()) = charity_id
    OR public.user_allows_public_visibility(donor_id, 'showDonations')
  );

-- Add RLS policy for volunteer_hours: public access respects privacy
DROP POLICY IF EXISTS "Public can view volunteer hours from public users" ON volunteer_hours;
CREATE POLICY "Public can view volunteer hours from public users" ON volunteer_hours
  FOR SELECT
  USING (
    (SELECT auth.uid()) = volunteer_id
    OR (SELECT auth.uid()) = charity_id
    OR public.user_allows_public_visibility(volunteer_id, 'showVolunteerHours')
  );

-- Add RLS policy for self_reported_hours: public access respects privacy
DROP POLICY IF EXISTS "Public can view self-reported hours from public users" ON self_reported_hours;
CREATE POLICY "Public can view self-reported hours from public users" ON self_reported_hours
  FOR SELECT
  USING (
    (SELECT auth.uid()) = volunteer_id
    OR (
      organization_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.user_id = (SELECT auth.uid())
        AND p.id = self_reported_hours.organization_id
      )
    )
    OR public.user_allows_public_visibility(volunteer_id, 'showVolunteerHours')
  );

-- Add index on user_preferences.user_id for fast privacy lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON user_preferences (user_id);

-- Comment documenting the privacy enforcement approach
COMMENT ON FUNCTION public.user_allows_public_visibility IS
  'Checks if a user allows public visibility for a given privacy field. '
  'Returns true if no preferences exist (default public) or if both '
  'publicProfile and the specified field are not explicitly false. '
  'Used by RLS policies and application-level privacy filtering.';
