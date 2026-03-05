import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { FundImpactMetric } from '@/types/impact';

interface MetricFormData {
  fund_id: string;
  unit_name: string;
  unit_cost_usd: number;
  unit_icon: string;
  description_template: string;
  sort_order: number;
}

interface UseAdminImpactMetricsResult {
  metrics: FundImpactMetric[];
  loading: boolean;
  error: string | null;
  fetchAllMetrics: () => Promise<void>;
  createMetric: (_data: MetricFormData) => Promise<boolean>;
  updateMetric: (_id: string, _data: MetricFormData) => Promise<boolean>;
  deleteMetric: (_id: string) => Promise<boolean>;
}

/**
 * Admin CRUD hook for managing impact metrics.
 *
 * @returns Metrics state and CRUD operations
 */
export function useAdminImpactMetrics(): UseAdminImpactMetricsResult {
  const [metrics, setMetrics] = useState<FundImpactMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Maps a raw database row to a typed FundImpactMetric object. */
  const mapRow = (row: Record<string, unknown>): FundImpactMetric => ({
    id: row.id as string,
    fundId: row.fund_id as string,
    unitName: row.unit_name as string,
    unitCostUsd: Number(row.unit_cost_usd),
    unitIcon: row.unit_icon as string,
    descriptionTemplate: row.description_template as string,
    sortOrder: row.sort_order as number,
    updatedAt: row.updated_at as string,
  });

  const fetchAllMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('fund_impact_metrics')
        .select('*')
        .order('fund_id', { ascending: true })
        .order('sort_order', { ascending: true });

      if (dbError) throw dbError;
      setMetrics((data ?? []).map(mapRow));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMetric = useCallback(async (data: MetricFormData): Promise<boolean> => {
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('fund_impact_metrics')
        .insert(data);

      if (dbError) throw dbError;
      await fetchAllMetrics();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create metric');
      return false;
    }
  }, [fetchAllMetrics]);

  const updateMetric = useCallback(async (id: string, data: MetricFormData): Promise<boolean> => {
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('fund_impact_metrics')
        .update(data)
        .eq('id', id);

      if (dbError) throw dbError;
      await fetchAllMetrics();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update metric');
      return false;
    }
  }, [fetchAllMetrics]);

  const deleteMetric = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('fund_impact_metrics')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      await fetchAllMetrics();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete metric');
      return false;
    }
  }, [fetchAllMetrics]);

  return { metrics, loading, error, fetchAllMetrics, createMetric, updateMetric, deleteMetric };
}
