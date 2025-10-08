import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
// import { WithdrawalRequest } from '@/types/charity'; // Unused import
import { Logger } from '@/utils/logger';

interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at: string | null;
}

export const useWithdrawals = () => {
  const { profile } = useProfile();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      if (!profile?.id) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('charity_id', profile.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setWithdrawals(data || []);
      } catch (err) {
        setError('Error fetching withdrawals');
        Logger.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [profile]);

  const requestWithdrawal = async (amount: number) => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const { error: withdrawalError, data } = await supabase
        .from('withdrawal_requests')
        .insert({
          charity_id: profile.id,
          amount,
          status: 'pending'
        })
        .select()
        .single();

      if (withdrawalError) throw withdrawalError;
      setWithdrawals(prev => [data, ...prev]);
    } catch (err) {
      setError('Error requesting withdrawal');
      console.error('Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { withdrawals, requestWithdrawal, loading, error };
};