import React, { useCallback } from 'react';
import { cn } from '@/utils/cn';
import type { DonationFrequency } from './types/donation';

interface DonationFrequencyToggleProps {
  /** Currently selected frequency */
  value: DonationFrequency;
  /** Callback when frequency changes */
  onChange: (_frequency: DonationFrequency) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

/**
 * Toggle for selecting one-time or monthly recurring donations
 * @component DonationFrequencyToggle
 * @description Compact toggle for donation frequency with subtle styling.
 * @param {Object} props - Component props
 * @param {DonationFrequency} props.value - Currently selected frequency ('once' | 'monthly')
 * @param {function} props.onChange - Callback when selection changes
 * @param {boolean} [props.disabled] - Whether the toggle is disabled
 * @returns {React.ReactElement} Donation frequency toggle component
 */
export function DonationFrequencyToggle({
  value,
  onChange,
  disabled = false,
}: DonationFrequencyToggleProps): React.ReactElement {
  const handleOnceClick = useCallback(() => {
    if (!disabled) {
      onChange('once');
    }
  }, [disabled, onChange]);

  const handleMonthlyClick = useCallback(() => {
    if (!disabled) {
      onChange('monthly');
    }
  }, [disabled, onChange]);

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative flex rounded-lg p-1',
          'bg-gray-100 dark:bg-slate-800',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Sliding background indicator */}
        <div
          className={cn(
            'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md',
            'bg-white dark:bg-slate-700',
            'shadow-sm transition-transform duration-200 ease-out',
            value === 'monthly' && 'translate-x-[calc(100%+4px)]'
          )}
        />

        {/* Give Once button */}
        <button
          type="button"
          onClick={handleOnceClick}
          disabled={disabled}
          className={cn(
            'relative z-10 flex-1 flex items-center justify-center',
            'px-4 py-2 rounded-md',
            'text-sm font-medium transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
            value === 'once'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
          aria-pressed={value === 'once'}
        >
          Give Once
        </button>

        {/* Monthly button */}
        <button
          type="button"
          onClick={handleMonthlyClick}
          disabled={disabled}
          className={cn(
            'relative z-10 flex-1 flex items-center justify-center',
            'px-4 py-2 rounded-md',
            'text-sm font-medium transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
            value === 'monthly'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
          aria-pressed={value === 'monthly'}
        >
          Monthly
        </button>
      </div>
    </div>
  );
}
