import React from "react";
import { Check, Plus } from "lucide-react";
import type { ChainConfig } from "@/contexts/ChainContext";

interface NetworkCardProps {
  /** Chain config object */
  chain: ChainConfig;
  /** Shows glow + checkmark when true */
  isSelected: boolean;
  /** Click handler */
  onSelect: (_e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Desaturated placeholder mode */
  isComingSoon?: boolean;
  /** Stagger entrance delay in ms */
  animationDelay?: number;
}

/**
 * Horizontal glassmorphism network card for vertical network selection list
 * @param props - Component props
 * @returns Network card button component
 */
export const NetworkCard: React.FC<NetworkCardProps> = ({
  chain,
  isSelected,
  onSelect,
  isComingSoon = false,
  animationDelay = 0,
}) => {
  if (isComingSoon) {
    return (
      <button
        type="button"
        disabled
        aria-label="Coming Soon"
        className="relative w-full rounded-xl text-left opacity-0 animate-staggerIn
          bg-white/80 backdrop-blur-[10px] border border-white/30
          shadow-[0_10px_30px_rgba(0,0,0,0.05)]
          opacity-50 grayscale cursor-not-allowed
          flex items-center justify-center gap-3 min-h-[80px]"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <Plus className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-400 font-medium">Coming Soon</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      data-chain-id={chain.id}
      aria-label={chain.name}
      aria-pressed={isSelected}
      className={`relative w-full rounded-xl text-left opacity-0 animate-staggerIn
        bg-white/80 backdrop-blur-[10px] border
        shadow-[0_10px_30px_rgba(0,0,0,0.05)]
        transition-all duration-200
        flex items-center gap-4 min-h-[80px] py-4 pr-4 pl-0
        focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
        overflow-hidden
        ${isSelected
          ? "border-transparent"
          : "border-white/30 hover:border-white/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
        }`}
      style={{
        animationDelay: `${animationDelay}ms`,
        ...(isSelected && {
          boxShadow: `0 0 0 2px ${chain.color}, 0 10px 30px rgba(0,0,0,0.05)`,
        }),
      }}
    >
      {/* Left accent border matching network brand color */}
      <div
        className="w-1 self-stretch rounded-l-xl flex-shrink-0"
        style={{ backgroundColor: chain.color }}
      />

      {/* Chain icon */}
      <img
        src={chain.iconPath}
        alt={`${chain.name} icon`}
        className="w-10 h-10 flex-shrink-0"
        width={40}
        height={40}
      />

      {/* Title + subtext */}
      <div className="flex-1 text-left min-w-0">
        <p className="font-bold text-gray-900 leading-tight" style={{ fontSize: "1.1rem" }}>
          {chain.name}
        </p>
        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
          {chain.description}
        </p>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Breathing glow overlay when selected */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-xl animate-breathe pointer-events-none"
          style={{ boxShadow: `inset 0 0 20px 4px ${chain.color}15` }}
        />
      )}
    </button>
  );
};
