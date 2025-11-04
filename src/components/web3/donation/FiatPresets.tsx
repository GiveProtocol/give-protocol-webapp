import React, { useCallback } from "react";
import { TokenConfig } from "@/config/tokens";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { formatFiat } from "@/utils/formatters";
import { cn } from "@/utils/cn";

interface FiatPresetsProps {
  selectedToken: TokenConfig;
  onAmountSelect: (_cryptoAmount: number) => void;
}

const PRESET_AMOUNTS = [10, 50, 100, 500];

/**
 * Quick fiat amount preset buttons
 * @component FiatPresets
 * @description Provides quick selection buttons for common donation amounts in fiat currency.
 * Automatically converts to crypto based on live prices.
 * @param {Object} props - Component props
 * @param {TokenConfig} props.selectedToken - Currently selected token
 * @param {function} props.onAmountSelect - Callback with crypto amount when preset is clicked
 * @returns {React.ReactElement} Fiat presets component
 */
export function FiatPresets({
  selectedToken,
  onAmountSelect,
}: FiatPresetsProps): React.ReactElement {
  const { selectedCurrency, tokenPrices, convertFromFiat } = useCurrencyContext();

  const handlePresetClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const fiatAmount = Number.parseFloat(e.currentTarget.dataset.amount || "0");
      if (fiatAmount <= 0) return;

      const tokenPrice = tokenPrices[selectedToken.coingeckoId];
      if (!tokenPrice || tokenPrice === 0) {
        return;
      }

      const cryptoAmount = convertFromFiat(fiatAmount, selectedToken.coingeckoId);
      onAmountSelect(cryptoAmount);
    },
    [selectedToken.coingeckoId, tokenPrices, convertFromFiat, onAmountSelect]
  );

  const tokenPrice = tokenPrices[selectedToken.coingeckoId];
  const hasPrice = tokenPrice !== undefined && tokenPrice > 0;

  if (!hasPrice) {
    return (
      <div className="text-sm text-amber-600">
        Quick amounts unavailable without price data
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Quick Amounts
      </label>
      <div className="grid grid-cols-4 gap-2">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            data-amount={amount}
            onClick={handlePresetClick}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg",
              "border border-gray-300 bg-white",
              "hover:bg-indigo-50 hover:border-indigo-500",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500",
              "transition-colors"
            )}
          >
            {formatFiat(amount, selectedCurrency, { decimals: 0 })}
          </button>
        ))}
      </div>
    </div>
  );
}
