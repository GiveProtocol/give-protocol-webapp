import React, { useCallback, useState } from "react";
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
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handlePresetClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const fiatAmount = Number.parseFloat(e.currentTarget.dataset.amount || "0");
      if (fiatAmount <= 0) return;

      const tokenPrice = tokenPrices[selectedToken.coingeckoId];
      if (!tokenPrice || tokenPrice === 0) {
        return;
      }

      setSelectedAmount(fiatAmount);
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
      <h3 className="block text-sm font-medium text-gray-700">
        Quick Amounts
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {PRESET_AMOUNTS.map((amount) => {
          const isSelected = selectedAmount === amount;
          return (
            <button
              key={amount}
              type="button"
              data-amount={amount}
              onClick={handlePresetClick}
              className={cn(
                "px-5 py-3 text-sm font-semibold rounded-xl",
                "border-2 transition-all duration-200 ease-in-out",
                "focus:outline-none focus:ring-3 focus:ring-offset-2",
                "active:scale-95 transform",
                isSelected
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-600 text-white shadow-lg"
                  : "bg-white border-gray-300 text-gray-700 hover:border-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-md focus:ring-indigo-500"
              )}
            >
              {formatFiat(amount, selectedCurrency, { decimals: 0 })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
