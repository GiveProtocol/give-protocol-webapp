import React, { useState, useCallback } from "react";
import { TokenConfig, MOONBEAM_TOKENS } from "@/config/tokens";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { formatCrypto, formatFiat } from "@/utils/formatters";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface TokenSelectorProps {
  selectedToken: TokenConfig;
  onSelectToken: (_token: TokenConfig) => void;
  walletBalance?: number;
}

/**
 * Token selector dropdown component for choosing donation token
 * @component TokenSelector
 * @description Allows users to select which cryptocurrency token to donate with.
 * Shows token balances and fiat equivalents.
 * @param {Object} props - Component props
 * @param {TokenConfig} props.selectedToken - Currently selected token
 * @param {function} props.onSelectToken - Callback when token is selected
 * @param {number} [props.walletBalance] - User's balance for the selected token
 * @returns {React.ReactElement} Token selector component
 */
export function TokenSelector({
  selectedToken,
  onSelectToken,
  walletBalance,
}: TokenSelectorProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCurrency, tokenPrices, convertToFiat } = useCurrencyContext();

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleSelect = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const symbol = e.currentTarget.dataset.symbol;
      if (!symbol) return;

      const token = MOONBEAM_TOKENS.find((t) => t.symbol === symbol);
      if (token) {
        onSelectToken(token);
        setIsOpen(false);
      }
    },
    [onSelectToken]
  );

  const fiatValue = walletBalance
    ? convertToFiat(walletBalance, selectedToken.coingeckoId)
    : 0;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Token
      </label>

      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div className="flex items-center space-x-3">
          <img
            src={selectedToken.icon}
            alt={selectedToken.symbol}
            className="w-6 h-6 rounded-full"
          />
          <div className="text-left">
            <div className="font-medium text-gray-900">{selectedToken.symbol}</div>
            {walletBalance !== undefined && (
              <div className="text-sm text-gray-500">
                Balance: {formatCrypto(walletBalance, selectedToken, { decimals: 4 })}
                {fiatValue > 0 && (
                  <span className="text-gray-400">
                    {" "}
                    ({formatFiat(fiatValue, selectedCurrency, { decimals: 2 })})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-2">
            {MOONBEAM_TOKENS.map((token) => {
              const price = tokenPrices[token.coingeckoId];
              const isSelected = token.symbol === selectedToken.symbol;

              return (
                <button
                  key={token.symbol}
                  type="button"
                  data-symbol={token.symbol}
                  onClick={handleSelect}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 transition-colors",
                    isSelected && "bg-indigo-50"
                  )}
                >
                  <img
                    src={token.icon}
                    alt={token.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{token.symbol}</div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                  {price && (
                    <div className="text-sm text-gray-600">
                      {formatFiat(price, selectedCurrency, { decimals: 2 })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
