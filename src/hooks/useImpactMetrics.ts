import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { FundImpactMetric } from '@/types/impact';

interface UseImpactMetricsResult {
  metrics: FundImpactMetric[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches impact metrics for a given portfolio fund.
 *
 * @param fundId - The on-chain fund ID (e.g. '1', '2', '3')
 * @returns Metrics array, loading state, error, and refetch callback
 */
export function useImpactMetrics(fundId: string): UseImpactMetricsResult {
  const [metrics, setMetrics] = useState<FundImpactMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (signal: { cancelled: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('impact_metrics')
        .select('id, fund_id, unit_name, unit_cost_usd, unit_icon, description_template, sort_order, updated_at')
        .eq('fund_id', fundId)
        .order('sort_order', { ascending: true });

      if (signal.cancelled) return;

      // Table may not exist yet — treat as empty rather than erroring
      if (dbError) {
        const code = (dbError as Record<string, unknown>).code as string | undefined;
        if (code === '42P01' || code === 'PGRST204') {
          setMetrics([]);
          return;
        }
        throw dbError;
      }

      setMetrics(
        (data ?? []).map((row) => ({
          id: row.id as string,
          fundId: row.fund_id as string,
          unitName: row.unit_name as string,
          unitCostUsd: Number(row.unit_cost_usd),
          unitIcon: row.unit_icon as string,
          descriptionTemplate: row.description_template as string,
          sortOrder: row.sort_order as number,
          updatedAt: row.updated_at as string,
        }))
      );
    } catch (err) {
      if (!signal.cancelled) {
        setError(err instanceof Error ? err.message : 'Failed to load impact metrics');
      }
    } finally {
      if (!signal.cancelled) {
        setLoading(false);
      }
    }
  }, [fundId]);

  useEffect(() => {
    const signal = { cancelled: false };
    fetchMetrics(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [fetchMetrics]);

  const refetch = useCallback(() => {
    fetchMetrics({ cancelled: false });
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch };
}
