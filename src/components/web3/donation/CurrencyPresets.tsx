import React, { useCallback, useState } from "react";
import { cn } from "@/utils/cn";

interface CurrencyPresetsProps {
  presets: number[];
  symbol: string;
  onAmountSelect: (_amount: number) => void;
}

/**
 * Currency-aware amount preset pills with custom input.
 * 4-column grid. Active pill uses design system green.
 * @param props - Component props
 * @returns The CurrencyPresets component
 */
export function CurrencyPresets({
  presets,
  symbol,
  onAmountSelect,
}: CurrencyPresetsProps): React.ReactElement {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState("");

  const handlePresetClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const amount = Number.parseFloat(
        e.currentTarget.dataset.amount || "0",
      );
      if (amount <= 0) return;
      setSelectedPreset(amount);
      setCustomValue("");
      onAmountSelect(amount);
    },
    [onAmountSelect],
  );

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw !== "" && !/^\d*\.?\d{0,2}$/.test(raw)) return;
      setCustomValue(raw);
      setSelectedPreset(null);
      const parsed = Number.parseFloat(raw);
      if (!Number.isNaN(parsed) && parsed > 0) {
        onAmountSelect(parsed);
      } else {
        onAmountSelect(0);
      }
    },
    [onAmountSelect],
  );

  const isCustomActive = selectedPreset === null && customValue !== "";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {presets.map((amount) => {
          const isSelected = selectedPreset === amount;
          const label =
            amount >= 1000
              ? `${symbol}${amount.toLocaleString()}`
              : `${symbol}${amount}`;

          return (
            <button
              key={amount}
              type="button"
              data-amount={amount}
              onClick={handlePresetClick}
              className={cn(
                "py-2.5 text-sm font-medium rounded-full",
                "border transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)]",
                isSelected
                  ? "bg-[var(--green)] border-[var(--green)] text-white"
                  : "bg-white border-gray-200 text-[var(--text)] hover:border-[var(--green)] hover:bg-emerald-50",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="relative">
        <span
          className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none",
            isCustomActive ? "text-[var(--green-dark)]" : "text-gray-400",
          )}
        >
          {symbol}
        </span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Other amount"
          value={customValue}
          onChange={handleCustomChange}
          aria-label="Custom donation amount"
          className={cn(
            "w-full pl-8 pr-4 py-2.5 text-sm font-medium rounded-full",
            "border transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)]",
            "bg-white placeholder:text-gray-400",
            isCustomActive
              ? "border-[var(--green)] text-[var(--text)]"
              : "border-gray-200 text-[var(--text)]",
          )}
        />
      </div>
    </div>
  );
}
