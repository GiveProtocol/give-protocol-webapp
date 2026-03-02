import React, { useCallback } from "react";
import {
  getEnabledCurrencies,
  type FiatCurrencyConfig,
} from "@/config/fiatCurrencies";
import { cn } from "@/utils/cn";

interface FiatCurrencySelectorProps {
  /** Selected currency code */
  value: string;
  /** Callback when currency changes */
  onChange: (_currency: FiatCurrencyConfig) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

const enabledCurrencies = getEnabledCurrencies();

/**
 * Native select dropdown for fiat currency selection.
 * Format: "USD — US Dollar"
 * @param {FiatCurrencySelectorProps} props - Component props
 * @returns {React.ReactElement} The FiatCurrencySelector component
 */
export const FiatCurrencySelector: React.FC<FiatCurrencySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const currency = enabledCurrencies.find(
        (c) => c.code === e.target.value,
      );
      if (currency) {
        onChange(currency);
      }
    },
    [onChange],
  );

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Currency
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "w-full appearance-none rounded-xl border-2 bg-white dark:bg-slate-800 px-4 py-3 pr-10",
            "text-sm font-medium text-gray-900 dark:text-white",
            "border-gray-300 dark:border-slate-600",
            "focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none",
            "transition-colors duration-200",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          aria-label="Select currency"
        >
          {enabledCurrencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} — {currency.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
