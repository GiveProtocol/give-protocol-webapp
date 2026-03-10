import { supabase } from '@/lib/supabase';
import type { CharityProfile } from '@/types/charityProfile';
import { Logger } from '@/utils/logger';

interface ClaimCharityParams {
  ein: string;
  signerName: string;
  signerEmail: string;
  signerPhone: string;
}

/**
 * Claims an unclaimed charity profile by EIN via the claim_charity_profile RPC.
 * Sets the profile status to 'claimed-pending' and records the authorized signer details.
 * @param params - The claim parameters including EIN and signer contact info
 * @returns The updated charity profile or null on error
 */
export async function claimCharityProfile(
  params: ClaimCharityParams,
): Promise<CharityProfile | null> {
  try {
    const { data, error } = await supabase.rpc('claim_charity_profile', {
      p_ein: params.ein,
      p_signer_name: params.signerName,
      p_signer_email: params.signerEmail,
      p_signer_phone: params.signerPhone,
    });

    if (error) {
      Logger.error('Error claiming charity profile', { error, ein: params.ein });
      return null;
    }

    const rows = (data || []) as CharityProfile[];
    return rows[0] || null;
  } catch (error) {
    Logger.error('Charity profile claim failed', {
      error: error instanceof Error ? error.message : String(error),
      ein: params.ein,
    });
    return null;
  }
}

/**
 * Fetches or creates a charity profile by EIN via the get_or_create_charity_profile RPC.
 * Returns null if the EIN is empty, not found in IRS records, or on error.
 * @param ein - The Employer Identification Number to look up
 * @returns The charity profile or null
 */
export async function getCharityProfileByEin(
  ein: string,
): Promise<CharityProfile | null> {
  const trimmed = ein?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('get_or_create_charity_profile', {
      lookup_ein: trimmed,
    });

    if (error) {
      Logger.error('Error fetching charity profile', { error, ein: trimmed });
      return null;
    }

    const rows = (data || []) as CharityProfile[];
    return rows[0] || null;
  } catch (error) {
    Logger.error('Charity profile fetch failed', {
      error: error instanceof Error ? error.message : String(error),
      ein: trimmed,
    });
    return null;
  }
}
