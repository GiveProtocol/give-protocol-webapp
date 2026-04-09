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
  /** Number of Coming Soon placeholder cards (default: 1) */
  comingSoonCount?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Vertical stack container for network cards
 * @param props - Component props
 * @returns Network stack component
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
    return 1;
  }, [comingSoonCount]);

  return (
    <div className={`scrollbar-styled max-h-[60vh] overflow-y-auto ${className}`}>
      <div className="flex flex-col gap-3">
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
