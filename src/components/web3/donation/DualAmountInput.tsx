import React, { useState, useEffect, useCallback } from "react";
import { TokenConfig } from "@/config/tokens";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface DualAmountInputProps {
  token: TokenConfig;
  value: number;
  onChange: (_cryptoAmount: number) => void;
  maxBalance?: number;
}

type InputMode = "crypto" | "fiat";

/**
 * Dual amount input with crypto/fiat toggle
 * @component DualAmountInput
 * @description Input that allows switching between cryptocurrency and fiat currency input.
 * Automatically converts between the two based on live prices.
 * @param {Object} props - Component props
 * @param {TokenConfig} props.token - Token being donated
 * @param {number} props.value - Current crypto amount value
 * @param {function} props.onChange - Callback with crypto amount when value changes
 * @param {number} [props.maxBalance] - Maximum balance available (enables "Max" button)
 * @returns {React.ReactElement} Dual amount input component
 */
export function DualAmountInput({
  token,
  value,
  onChange,
  maxBalance,
}: DualAmountInputProps): React.ReactElement {
  const { selectedCurrency, tokenPrices, convertToFiat, convertFromFiat } =
    useCurrencyContext();
  const [inputMode, setInputMode] = useState<InputMode>("crypto");
  const [displayValue, setDisplayValue] = useState("");

  const tokenPrice = tokenPrices[token.coingeckoId];

  // Update display value when value or mode changes
  useEffect(() => {
    if (value === 0) {
      setDisplayValue("");
      return;
    }

    if (inputMode === "crypto") {
      setDisplayValue(value.toString());
    } else {
      const fiatValue = convertToFiat(value, token.coingeckoId);
      setDisplayValue(fiatValue > 0 ? fiatValue.toFixed(2) : "");
    }
  }, [value, inputMode, convertToFiat, token.coingeckoId]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setDisplayValue(newValue);

      const numValue = Number.parseFloat(newValue);
      if (Number.isNaN(numValue) || numValue <= 0) {
        onChange(0);
        return;
      }

      if (inputMode === "crypto") {
        onChange(numValue);
      } else {
        // Convert fiat to crypto
        const cryptoAmount = convertFromFiat(numValue, token.coingeckoId);
        onChange(cryptoAmount);
      }
    },
    [inputMode, onChange, convertFromFiat, token.coingeckoId]
  );

  const handleMaxClick = useCallback(() => {
    if (maxBalance !== undefined) {
      onChange(maxBalance);
    }
  }, [maxBalance, onChange]);

  const handleToggleMode = useCallback(() => {
    setInputMode((mode) => (mode === "crypto" ? "fiat" : "crypto"));
  }, []);

  const fiatEquivalent = convertToFiat(value, token.coingeckoId);
  const hasPrice = tokenPrice !== undefined && tokenPrice > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="donation-amount-input" className="block text-sm font-medium text-gray-700">
          Donation Amount
        </label>
        {hasPrice && (
          <button
            type="button"
            onClick={handleToggleMode}
            className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>
              Switch to {inputMode === "crypto" ? selectedCurrency.code : token.symbol}
            </span>
          </button>
        )}
      </div>

      <div className="relative">
        <input
          id="donation-amount-input"
          type="number"
          value={displayValue}
          onChange={handleInputChange}
          placeholder="0.00"
          min="0"
          step="any"
          className={cn(
            "w-full py-4 border-2 rounded-xl transition-all duration-200",
            "focus:outline-none focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500",
            "text-lg font-semibold text-right",
            // Hide native number input spin buttons to avoid clash with suffix
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            // Left padding for input, right padding for suffix (symbol + MAX button)
            "pl-4 pr-32",
            value > 0 && maxBalance !== undefined && value > maxBalance
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
              : "border-gray-300"
          )}
        />
        <div className="absolute right-3 top-0 h-full flex items-center gap-2 pointer-events-none">
          <span className="text-sm font-medium text-gray-500 min-w-[3rem] text-right">
            {inputMode === "crypto" ? token.symbol : selectedCurrency.code}
          </span>
          {maxBalance !== undefined && (
            <button
              type="button"
              onClick={handleMaxClick}
              className="px-3 py-1 text-xs font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-md uppercase transition-all duration-200 hover:shadow-md pointer-events-auto"
            >
              Max
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        {maxBalance !== undefined && (
          <div className="text-gray-600">
            <span className="font-medium">Balance:</span>
            {' '}
            <span className={cn(
              "font-semibold",
              value > maxBalance ? "text-red-600" : "text-gray-900"
            )}>
              {maxBalance.toFixed(6)} {token.symbol}
            </span>
          </div>
        )}
        {hasPrice && value > 0 && (
          <div className="text-gray-500">
            {inputMode === "crypto" ? (
              <span>
                ≈ {selectedCurrency.symbol}
                {fiatEquivalent.toFixed(2)} {selectedCurrency.code}
              </span>
            ) : (
              <span>
                ≈ {value.toFixed(6)} {token.symbol}
              </span>
            )}
          </div>
        )}
      </div>

      {value > 0 && maxBalance !== undefined && value > maxBalance && (
        <div className="text-sm text-red-600 font-medium">
          Insufficient balance. Maximum available: {maxBalance.toFixed(6)} {token.symbol}
        </div>
      )}

      {!hasPrice && (
        <div className="text-sm text-amber-600">
          Price data not available. Using crypto amount only.
        </div>
      )}
    </div>
  );
}
