-- Migration: Add get_charity_record_by_ein RPC
-- Fixes: Direct table queries on charity_organizations fail when RLS is enabled
-- because there is no SELECT policy for anon/authenticated roles.
-- The search RPC (search_charity_organizations) works because it is SECURITY DEFINER.
-- This RPC provides the same bypass for single-EIN lookups used by CharityProfilePage.

CREATE OR REPLACE FUNCTION get_charity_record_by_ein(lookup_ein TEXT)
RETURNS TABLE (
  ein              TEXT,
  name             TEXT,
  ico              TEXT,
  street           TEXT,
  city             TEXT,
  state            TEXT,
  zip              TEXT,
  group_exemption  TEXT,
  subsection       TEXT,
  affiliation      TEXT,
  classification   TEXT,
  ruling           TEXT,
  deductibility    TEXT,
  foundation       TEXT,
  activity         TEXT,
  organization     TEXT,
  status           TEXT,
  ntee_cd          TEXT,
  sort_name        TEXT,
  is_on_platform   BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized TEXT;
BEGIN
  -- Strip hyphens/non-digits for US EINs; keep original for international IDs
  v_normalized := regexp_replace(COALESCE(lookup_ein, ''), '-', '', 'g');

  RETURN QUERY
  SELECT
    co.ein,
    co.name,
    co.ico,
    co.street,
    co.city,
    co.state,
    co.zip,
    co.group_exemption,
    co.subsection,
    co.affiliation,
    co.classification,
    co.ruling,
    co.deductibility,
    co.foundation,
    co.activity,
    co.organization,
    co.status,
    co.ntee_cd,
    co.sort_name,
    co.is_on_platform
  FROM charity_organizations co
  WHERE co.ein = v_normalized
     OR co.ein = lookup_ein
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION get_charity_record_by_ein(TEXT) IS
  'Returns a single charity organization record by EIN. '
  'Handles both hyphenated (12-3456789) and plain (123456789) formats. '
  'SECURITY DEFINER to bypass RLS on charity_organizations table.';

-- Allow both anonymous and authenticated access (charity data is public)
GRANT EXECUTE ON FUNCTION get_charity_record_by_ein(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_charity_record_by_ein(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_charity_record_by_ein(TEXT) TO service_role;
