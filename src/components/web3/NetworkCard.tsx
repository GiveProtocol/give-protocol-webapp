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
 * Bento-style glassmorphism network tile
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
        className="relative rounded-xl p-4 text-left opacity-0 animate-staggerIn
          bg-white/[0.07] backdrop-blur-md border border-white/[0.12]
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]
          opacity-50 grayscale cursor-not-allowed
          flex flex-col items-center justify-center gap-2 min-h-[140px]"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <Plus className="w-6 h-6 text-gray-400" />
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
      className={`relative rounded-xl p-4 text-left opacity-0 animate-staggerIn
        bg-white/[0.07] backdrop-blur-md border border-white/[0.12]
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]
        transition-all duration-200 hover:bg-white/[0.12] hover:border-white/[0.20]
        focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
        ${isSelected ? "border-white/[0.25]" : ""}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Breathing glow overlay */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-xl animate-breathe pointer-events-none"
          style={{
            boxShadow: `0 0 20px 4px ${chain.color}40, inset 0 0 20px 4px ${chain.color}15`,
          }}
        />
      )}

      {/* Checkmark */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Content */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={chain.iconPath}
          alt={`${chain.name} icon`}
          className="w-6 h-6"
          width={24}
          height={24}
        />
        <span className="font-semibold text-white text-sm">{chain.name}</span>
      </div>

      {/* Ecosystem badge */}
      <span
        className="inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2"
        style={{
          backgroundColor: `${chain.color}20`,
          color: chain.color,
        }}
      >
        {chain.ecosystem}
      </span>

      {/* Description */}
      <p className="text-xs text-gray-400 leading-relaxed">
        {chain.description}
      </p>
    </button>
  );
};
