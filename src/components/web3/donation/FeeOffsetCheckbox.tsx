import React, { useCallback, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { formatFiat } from '@/utils/formatters';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { calculateFeeOffset } from './types/donation';

interface FeeOffsetCheckboxProps {
  /** Amount in dollars */
  amount: number;
  /** Whether fees are being covered */
  checked: boolean;
  /** Callback when checkbox state changes */
  onChange: (_checked: boolean) => void;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
}

/**
 * Checkbox for opting to cover processing fees
 * @component FeeOffsetCheckbox
 * @description Displays fee calculation and allows donor to opt-in to cover processing fees.
 * Shows breakdown: "$50.00 + $1.50 fees = $51.50"
 * @param {Object} props - Component props
 * @param {number} props.amount - Base donation amount in dollars
 * @param {boolean} props.checked - Whether fees are being covered
 * @param {function} props.onChange - Callback when checkbox state changes
 * @param {boolean} [props.disabled] - Whether the checkbox is disabled
 * @returns {React.ReactElement} Fee offset checkbox component
 */
export function FeeOffsetCheckbox({
  amount,
  checked,
  onChange,
  disabled = false,
}: FeeOffsetCheckboxProps): React.ReactElement {
  const { selectedCurrency } = useCurrencyContext();

  const { fee, total } = useMemo(() => calculateFeeOffset(amount), [amount]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLLabelElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange(!checked);
      }
    },
    [checked, onChange]
  );

  // Don't show if amount is 0
  if (amount <= 0) {
    return <div className="h-14" />;
  }

  return (
    <label
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl cursor-pointer',
        'border-2 transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2',
        checked
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
          : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'mt-0.5 h-5 w-5 rounded border-2',
          'text-emerald-600 focus:ring-emerald-500',
          'transition-colors duration-150',
          checked
            ? 'border-emerald-600 bg-emerald-600'
            : 'border-gray-300 dark:border-slate-600'
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Cover processing fees
          </span>
          {checked && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              +{formatFiat(fee, selectedCurrency, { decimals: 2 })}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {checked ? (
            <span>
              {formatFiat(amount, selectedCurrency, { decimals: 2 })} + {formatFiat(fee, selectedCurrency, { decimals: 2 })} fees ={' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {formatFiat(total, selectedCurrency, { decimals: 2 })}
              </span>
            </span>
          ) : (
            <span>
              Add {formatFiat(fee, selectedCurrency, { decimals: 2 })} to ensure 100% of your {formatFiat(amount, selectedCurrency, { decimals: 2 })} goes to the charity
            </span>
          )}
        </p>
      </div>
    </label>
  );
}
