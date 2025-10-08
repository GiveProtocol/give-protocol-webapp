import { useEffect, useState } from 'react';
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

export const useDonorData = () => {
  const { profile } = useProfile();
  const [data, setData] = useState<DonorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonorData = async () => {
      if (!profile?.id) return;

      try {
        // Get donations using the donations table directly
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
          .eq('donor_id', profile.id)
          .order('created_at', { ascending: false });

        if (donationsError) throw donationsError;

        const formattedDonations = donations?.map(d => ({
          id: d.id,
          date: d.created_at,
          charity: d.charity?.charity_details?.name || 'Unknown Charity',
          amount: d.amount,
          impactGrowth: d.amount * 0.12 // Example individual growth
        })) || [];

        const totalDonated = formattedDonations.reduce((sum, d) => sum + d.amount, 0);
        const impactGrowth = totalDonated * 0.12; // Example growth calculation
        const uniqueCharities = new Set(formattedDonations.map(d => d.charity));

        setData({
          totalDonated,
          impactGrowth,
          charitiesSupported: uniqueCharities.size,
          donations: formattedDonations
        });
      } catch (err) {
        Logger.error('Error fetching donor data', { error: err });
        setError('Error fetching donor data');
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [profile]);

  return { data, loading, error };
};