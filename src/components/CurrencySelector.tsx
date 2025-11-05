import React, { useState, useRef, useEffect, useCallback } from "react";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { SUPPORTED_CURRENCIES } from "@/config/tokens";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Currency selector dropdown component
 * @component CurrencySelector
 * @description Dropdown menu for selecting the preferred fiat currency for display.
 * Shows current currency and allows switching between all supported currencies.
 * Persists selection to localStorage via CurrencyContext.
 * @returns {React.ReactElement} Currency selector dropdown
 * @example
 * ```tsx
 * <CurrencySelector />
 * ```
 */
export function CurrencySelector(): React.ReactElement {
  const { selectedCurrency, setSelectedCurrency } = useCurrencyContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const code = e.currentTarget.dataset.code;
      if (!code) return;

      const currency = SUPPORTED_CURRENCIES.find((c) => c.code === code);
      if (currency) {
        setSelectedCurrency(currency);
        setIsOpen(false);
      }
    },
    [setSelectedCurrency]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex items-center space-x-1 px-3 py-2 rounded-lg",
          "text-sm font-medium text-white",
          "hover:bg-white/10 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-white",
          isOpen && "bg-white/10"
        )}
        aria-label="Select currency"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-base">{selectedCurrency.symbol}</span>
        <span className="hidden sm:inline">{selectedCurrency.code}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            Select Currency
          </div>
          <div className="max-h-64 overflow-y-auto">
            {SUPPORTED_CURRENCIES.map((currency) => {
              const isSelected = currency.code === selectedCurrency.code;
              return (
                <button
                  key={currency.code}
                  type="button"
                  data-code={currency.code}
                  onClick={handleSelect}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm",
                    "hover:bg-indigo-50 transition-colors",
                    "flex items-center justify-between",
                    isSelected && "bg-indigo-100 text-indigo-900 font-medium"
                  )}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-base">{currency.symbol}</span>
                    <span>{currency.code}</span>
                  </span>
                  <span className="text-xs text-gray-500">{currency.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
