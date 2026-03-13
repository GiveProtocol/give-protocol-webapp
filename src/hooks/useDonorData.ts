import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { Logger } from '@/utils/logger';

interface DonorData {
  totalDonated: number;
  impactGrowth: number;
  charitiesSupported: number;
  donations: Array<{
    id: string;
    date: string;
    charity: string;
    amount: number;
    impactGrowth: number;
  }>;
}

/**
 * Retrieves donation data for a given donor profile from Supabase, formats the donations,
 * and calculates summary statistics including total donated amount, impact growth,
 * and number of unique charities supported.
 *
 * @param {string} profileId - The ID of the donor profile for which to fetch donation data.
 * @returns {Promise<DonorData>} A promise that resolves to an object containing the donor data,
 * including totalDonated, impactGrowth, charitiesSupported, and an array of formatted donations.
 */
async function fetchDonorData(profileId: string): Promise<DonorData> {
  const { data: donations, error: donationsError } = await supabase
    .from('donations')
    .select(`
      id,
      amount,
      created_at,
      charity:charity_id (
        charity_details (
          name
        )
      )
    `)
    .eq('donor_id', profileId)
    .order('created_at', { ascending: false });

  if (donationsError) throw donationsError;

  const formattedDonations = donations?.map(d => ({
    id: d.id,
    date: d.created_at,
    charity: d.charity?.charity_details?.name || 'Unknown Charity',
    amount: d.amount,
    impactGrowth: d.amount * 0.12,
  })) || [];

  const totalDonated = formattedDonations.reduce((sum, d) => sum + d.amount, 0);
  const impactGrowth = totalDonated * 0.12;
  const uniqueCharities = new Set(formattedDonations.map(d => d.charity));

  return {
    totalDonated,
    impactGrowth,
    charitiesSupported: uniqueCharities.size,
    donations: formattedDonations,
  };
}

/**
 * Custom React hook to fetch and manage donor data using React Query.
 *
 * @returns {{ data: DonorData | null; loading: boolean; error: string | null }}
 *   An object containing the donor data (or null if not loaded),
 *   a loading state flag, and an error message string if an error occurred.
 */
export const useDonorData = () => {
  const { profile } = useProfile();

  const { data = null, isLoading: loading, error: queryError } = useQuery<DonorData>({
    queryKey: ['donorData', profile?.id],
    queryFn: () => {
      if (!profile?.id) {
        return Promise.reject(new Error('No profile'));
      }
      return fetchDonorData(profile.id);
    },
    enabled: Boolean(profile?.id),
    staleTime: 5 * 60 * 1000,
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Error fetching donor data') : null;
  if (queryError) {
    Logger.error('Error fetching donor data', { error: queryError });
  }

  return { data, loading, error };
};
