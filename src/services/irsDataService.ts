import { supabase } from '@/lib/supabase';
import { Logger } from '@/utils/logger';

/**
 * Extended IRS organization record with all BMF fields.
 * Queried directly from irs_organizations table for the profile page.
 */
export interface IrsRecord {
  ein: string;
  name: string;
  ico: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  group_exemption: string | null;
  subsection: string | null;
  affiliation: string | null;
  classification: string | null;
  ruling: string | null;
  deductibility: string | null;
  foundation: string | null;
  activity: string | null;
  organization: string | null;
  status: string | null;
  ntee_cd: string | null;
  sort_name: string | null;
  is_on_platform: boolean;
}

/**
 * Fetches a full IRS organization record by EIN.
 * @param ein - The EIN (with or without hyphen)
 * @returns The IRS record or null if not found
 */
export async function getIrsRecordByEin(ein: string): Promise<IrsRecord | null> {
  const normalized = ein.replace(/-/g, '');
  try {
    const { data, error } = await supabase
      .from('irs_organizations')
      .select('ein, name, ico, street, city, state, zip, group_exemption, subsection, affiliation, classification, ruling, deductibility, foundation, activity, organization, status, ntee_cd, sort_name, is_on_platform')
      .eq('ein', normalized)
      .single();

    if (error) {
      Logger.error('Error fetching IRS record', { error, ein: normalized });
      return null;
    }
    return data as IrsRecord;
  } catch (error) {
    Logger.error('IRS record fetch failed', {
      error: error instanceof Error ? error.message : String(error),
      ein: normalized,
    });
    return null;
  }
}

/**
 * Submits a removal request for an organization.
 * @param ein - The EIN of the organization
 * @param reason - The reason for requesting removal
 * @returns True if submitted successfully
 */
export async function submitRemovalRequest(ein: string, reason: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('removal_requests')
      .insert({ ein: ein.replace(/-/g, ''), reason });

    if (error) {
      Logger.error('Error submitting removal request', { error, ein });
      return false;
    }
    return true;
  } catch (error) {
    Logger.error('Removal request submission failed', {
      error: error instanceof Error ? error.message : String(error),
      ein,
    });
    return false;
  }
}
