import React, { useState, useCallback, useMemo } from 'react';
import {
  Trees, Sprout, Wind, Utensils, HeartPulse, HandCoins,
  GraduationCap, BookOpen, Award, Heart,
} from 'lucide-react';
import { useImpactMetrics } from '@/hooks/useImpactMetrics';
import { calculateImpact } from '@/utils/calculateImpact';
import { Skeleton } from '@/components/ui/Skeleton';

const SYNE_LINK_STYLE: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '0.72rem',
  letterSpacing: '0.1em',
};

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  trees: Trees,
  sprout: Sprout,
  wind: Wind,
  utensils: Utensils,
  'heart-pulse': HeartPulse,
  'hand-coins': HandCoins,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  award: Award,
  heart: Heart,
};

interface ImpactCalculatorProps {
  fundId: string;
  fundName: string;
}

/**
 * Interactive calculator showing estimated real-world impact of a donation.
 *
 * @param props - Component props
 * @returns Rendered impact calculator card
 */
export function ImpactCalculator({ fundId, fundName: _fundName }: ImpactCalculatorProps): React.ReactElement | null {
  const { metrics, loading, error } = useImpactMetrics(fundId);
  const [amount, setAmount] = useState(50);

  const results = useMemo(
    () => calculateImpact(amount, metrics),
    [amount, metrics]
  );

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (Number.isNaN(val)) return;
    setAmount(Math.max(0, Math.min(1000, val)));
  }, []);

  const handleInputBlur = useCallback(() => {
    if (amount < 5) setAmount(5);
  }, [amount]);

  // If the query fails (e.g. table not migrated yet), hide the calculator silently
  if (error) return null;

  return (
    <div className="bg-white dark:bg-[#111110] p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-[#f2f0ec] mb-4">
        See Your Potential Impact
      </h2>

      {loading ? (
        <div className="space-y-3">
          <Skeleton height={20} className="rounded w-full" />
          <Skeleton height={40} className="rounded w-full" />
          <Skeleton height={16} className="rounded w-3/4" count={3} />
        </div>
      ) : metrics.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No impact metrics configured for this fund yet.
        </p>
      ) : (
        <>
          {/* Slider */}
          <div className="mb-4">
            <input
              type="range"
              min={5}
              max={1000}
              step={5}
              value={amount}
              onChange={handleSliderChange}
              className="w-full accent-[#0d9f6e]"
              aria-label={`Donation amount: $${amount}`}
            />
          </div>

          {/* Number input */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg font-semibold text-gray-900 dark:text-[#f2f0ec]">$</span>
            <input
              type="number"
              min={5}
              max={1000}
              step={5}
              value={amount}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-24 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-lg font-semibold text-gray-900 dark:text-[#f2f0ec] bg-transparent focus:border-[#0d9f6e] focus:ring-1 focus:ring-[#0d9f6e] outline-none"
              aria-label="Donation amount in USD"
            />
          </div>

          {/* Results */}
          <ul className="space-y-3 mb-4">
            {results.map((result) => {
              const IconComponent = ICON_MAP[result.unitIcon] ?? Heart;
              return (
                <li key={result.metricId} className="flex items-start gap-3">
                  <IconComponent className="h-5 w-5 text-[#0d9f6e] mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{result.formattedValue}</span>{' '}
                    {result.unitName}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Footer link */}
          <a
            href="/docs/impact-methodology"
            className="block text-[#0d9f6e] dark:text-[#2dd4a2] hover:opacity-80 mt-2 text-center uppercase"
            style={SYNE_LINK_STYLE}
          >
            How we calculate this &rarr;
          </a>
        </>
      )}
    </div>
  );
}
