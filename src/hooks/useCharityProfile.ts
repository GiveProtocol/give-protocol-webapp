import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { CharityDetails } from '@/types/charity';
import { Logger } from '@/utils/logger';

export const useCharityProfile = () => {
  const { profile } = useProfile();
  const [charityProfile, setCharityProfile] = useState<CharityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharityProfile = async () => {
      if (!profile?.id) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('charity_details')
          .select('*')
          .eq('profile_id', profile.id)
          .single();

        if (fetchError) throw fetchError;
        setCharityProfile(data);
      } catch (err) {
        setError('Error fetching charity profile');
        Logger.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharityProfile();
  }, [profile]);

  const updateProfile = async (updates: Partial<CharityDetails>) => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('charity_details')
        .update(updates)
        .eq('profile_id', profile.id);

      if (updateError) throw updateError;
      setCharityProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      setError('Error updating charity profile');
      Logger.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { profile: charityProfile, updateProfile, loading, error };
};