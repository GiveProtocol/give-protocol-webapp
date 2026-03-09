import { supabase } from '@/lib/supabase';
import type { CharityProfile } from '@/types/charityProfile';
import { Logger } from '@/utils/logger';

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
