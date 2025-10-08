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
 * Donation analytics hook for fetching and managing donation metrics and timeseries data
 * @function useDonationAnalytics
 * @description Provides comprehensive donation analytics including aggregate metrics (total donated, donation count, averages)
 * and timeseries data for charting. Uses Supabase RPC functions for optimized data aggregation and automatic refresh on profile changes.
 * @returns {Object} Donation analytics data and utilities
 * @returns {DonationMetrics | null} returns.metrics - Aggregate donation metrics including totalDonated, donationCount, averageDonation, and impactMetrics
 * @returns {TimeseriesData[]} returns.timeseriesData - Array of time-series data points with date and amount for charts
 * @returns {boolean} returns.loading - Loading state for analytics fetch operations
 * @returns {Function} returns.refreshAnalytics - Manually refresh analytics data: () => Promise<void>
 * @example
 * ```tsx
 * const { metrics, timeseriesData, loading, refreshAnalytics } = useDonationAnalytics();
 *
 * if (loading) return <AnalyticsLoading />;
 *
 * return (
 *   <div>
 *     <MetricCard
 *       title="Total Donated"
 *       value={metrics?.totalDonated || 0}
 *       format="currency"
 *     />
 *     <MetricCard
 *       title="Donation Count"
 *       value={metrics?.donationCount || 0}
 *     />
 *     <Chart data={timeseriesData} />
 *     <button onClick={refreshAnalytics}>Refresh</button>
 *   </div>
 * );
 * ```
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
