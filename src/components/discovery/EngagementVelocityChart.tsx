import React, { useMemo } from "react";
import { Card } from "@/components/ui/Card";

interface DailyPoint {
  date: string;
  total: number;
  count: number;
}

interface EngagementVelocityChartProps {
  dailyTotals: DailyPoint[];
  loading?: boolean;
}

const WIDTH = 640;
const HEIGHT = 160;
const PADDING = 8;

/**
 * Builds an SVG polyline path string from a value series, normalizing the max value to
 * the chart height so each line fills its own vertical range.
 */
function buildPath(values: number[]): string {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  const step = (WIDTH - PADDING * 2) / Math.max(values.length - 1, 1);
  return values
    .map((v, i) => {
      const x = PADDING + i * step;
      const y = HEIGHT - PADDING - (v / max) * (HEIGHT - PADDING * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/**
 * Lightweight SVG sparkline of donation count and average amount over the last 30 days.
 * Shipped as the "Engagement Velocity" Beta view until a richer sentiment pipeline exists.
 */
export const EngagementVelocityChart: React.FC<
  EngagementVelocityChartProps
> = ({ dailyTotals, loading = false }) => {
  const { countPath, amountPath, hasData } = useMemo(() => {
    const counts = dailyTotals.map((d) => d.count);
    const avgAmounts = dailyTotals.map((d) =>
      d.count > 0 ? d.total / d.count : 0,
    );
    return {
      countPath: buildPath(counts),
      amountPath: buildPath(avgAmounts),
      hasData: counts.some((c) => c > 0),
    };
  }, [dailyTotals]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Engagement Velocity
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Donations per day and average gift size, last 30 days
          </p>
        </div>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Beta
        </span>
      </div>

      <div className="mt-4 flex gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <span className="inline-block h-2 w-4 rounded bg-emerald-500" />
          Donations / day
        </span>
        <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <span className="inline-block h-2 w-4 rounded bg-indigo-500" />
          Avg. gift size
        </span>
      </div>

      <div className="mt-3">
        {loading || !hasData ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-500 dark:text-gray-400">
            {loading
              ? "Loading velocity data…"
              : "No donations yet in the last 30 days."}
          </div>
        ) : (
          <svg
            role="img"
            aria-label="Engagement velocity chart"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full h-40"
          >
            <path
              d={countPath}
              fill="none"
              stroke="#10b981"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={amountPath}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </Card>
  );
};
