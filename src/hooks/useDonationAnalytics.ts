import { useState, useEffect, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";
import { supabase } from "../lib/supabase";
import { useProfile } from "./useProfile";

interface DonationMetrics {
  totalDonated: number;
  donationCount: number;
  averageDonation: number;
  impactMetrics: Record<string, number>;
}

interface TimeseriesData {
  date: string;
  amount: number;
}

/**
 * Donation analytics hook for fetching and managing donation metrics and timeseries data.
 *
 * Privacy: This hook fetches the authenticated user's own donation data only.
 * The RPC functions (get_donation_metrics, get_donation_timeseries) should enforce
 * that the caller can only access their own data. Privacy settings (showDonations)
 * do not restrict self-view — they control visibility to OTHER users via leaderboards
 * and public-facing queries (handled in contributionAggregationService).
 *
 * @returns Donation analytics data and utilities
 */
export function useDonationAnalytics() {
  const [metrics, setMetrics] = useState<DonationMetrics | null>(null);
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesData[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { profile } = useProfile();

  const fetchAnalytics = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      // Fetch aggregate metrics
      const { data: metricsData, error: metricsError } = await supabase.rpc(
        "get_donation_metrics",
        { user_id: profile.id },
      );

      if (metricsError) throw metricsError;

      // Fetch timeseries data
      const { data: timeseriesData, error: timeseriesError } =
        await supabase.rpc("get_donation_timeseries", { user_id: profile.id });

      if (timeseriesError) throw timeseriesError;

      setMetrics(metricsData);
      setTimeseriesData(timeseriesData);
    } catch (error) {
      showToast("error", "Failed to fetch analytics");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [profile?.id, showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [profile?.id, fetchAnalytics]);

  return {
    metrics,
    timeseriesData,
    loading,
    refreshAnalytics: fetchAnalytics,
  };
}
