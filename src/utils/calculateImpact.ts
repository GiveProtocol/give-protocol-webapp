import type { FundImpactMetric, ImpactResult } from '@/types/impact';

/**
 * Calculates estimated real-world impact for a given USD amount.
 *
 * @param amountUsd - Dollar amount to calculate impact for
 * @param metrics - Array of fund impact metrics
 * @returns Sorted array of impact results
 */
export function calculateImpact(
  amountUsd: number,
  metrics: FundImpactMetric[]
): ImpactResult[] {
  if (amountUsd <= 0 || metrics.length === 0) return [];

  return [...metrics]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((metric) => {
      const rawValue = amountUsd / metric.unitCostUsd;
      const value = rawValue >= 1 ? Math.floor(rawValue) : Math.round(rawValue * 10) / 10;
      const formattedValue = value >= 1 ? value.toLocaleString() : String(value);
      const description = metric.descriptionTemplate
        .replace('{{value}}', formattedValue)
        .replace('{{unit_name}}', metric.unitName);

      return {
        metricId: metric.id,
        unitName: metric.unitName,
        unitIcon: metric.unitIcon,
        value,
        formattedValue,
        description,
      };
    });
}
