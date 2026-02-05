import React, { useMemo } from "react";
import { NetworkCard } from "./NetworkCard";
import type { ChainConfig, ChainId } from "@/contexts/ChainContext";

interface NetworkGridProps {
  /** Chains to display */
  chains: ChainConfig[];
  /** Currently selected chain ID */
  selectedChainId: ChainId | null;
  /** Selection handler */
  onChainSelect: (_e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Number of Coming Soon placeholder cards (default: auto-fill last row, min 1) */
  comingSoonCount?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Responsive grid container for network cards
 * @param props - Component props
 * @returns Network grid component
 */
export const NetworkGrid: React.FC<NetworkGridProps> = ({
  chains,
  selectedChainId,
  onChainSelect,
  comingSoonCount,
  className = "",
}) => {
  const placeholderCount = useMemo(() => {
    if (comingSoonCount !== undefined) return comingSoonCount;
    // Auto-fill: ensure at least 1 placeholder, fill to complete the last row of 3
    const remainder = chains.length % 3;
    return remainder === 0 ? 1 : 3 - remainder;
  }, [comingSoonCount, chains.length]);

  return (
    <div className={`scrollbar-styled max-h-[60vh] overflow-y-auto ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {chains.map((chain, index) => (
          <NetworkCard
            key={chain.id}
            chain={chain}
            isSelected={selectedChainId === chain.id}
            onSelect={onChainSelect}
            animationDelay={index * 80}
          />
        ))}
        {Array.from({ length: placeholderCount }, (_, i) => (
          <NetworkCard
            key={`coming-soon-${String(i)}`}
            chain={chains[0]}
            isSelected={false}
            onSelect={onChainSelect}
            isComingSoon
            animationDelay={(chains.length + i) * 80}
          />
        ))}
      </div>
    </div>
  );
};
