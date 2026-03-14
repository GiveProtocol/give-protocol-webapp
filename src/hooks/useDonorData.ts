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

/** Fetches and returns aggregated donor statistics and donation history. */
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

  let error: string | null = null;
  if (queryError) {
    error = queryError instanceof Error ? queryError.message : 'Error fetching donor data';
  }
  if (queryError) {
    Logger.error('Error fetching donor data', { error: queryError });
  }

  return { data, loading, error };
};
