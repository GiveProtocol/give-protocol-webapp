import React, { useCallback, useState } from "react";
import { Check, Wallet, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useChain, type ChainConfig, type ChainId } from "@/contexts/ChainContext";

interface ChainSelectionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when selection is complete */
  onComplete: () => void;
  /** Optional: Pre-detected chain ID from wallet */
  detectedChainId?: number;
}

/**
 * Modal for first-time chain selection during onboarding
 * @param props - Component props
 * @returns Chain selection modal component
 */
export const ChainSelectionModal: React.FC<ChainSelectionModalProps> = ({
  isOpen,
  onComplete,
  detectedChainId,
}) => {
  const { availableChains, selectChain, isSupported } = useChain();

  // Initialize with detected chain if supported, otherwise null
  const [selectedId, setSelectedId] = useState<ChainId | null>(() => {
    if (detectedChainId && isSupported(detectedChainId)) {
      return detectedChainId as ChainId;
    }
    return null;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChainSelect = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const chainId = Number(e.currentTarget.dataset.chainId) as ChainId;
      setSelectedId(chainId);
      setError(null);
    },
    [],
  );

  const handleContinue = useCallback(async () => {
    if (!selectedId) return;

    setIsProcessing(true);
    setError(null);

    try {
      selectChain(selectedId);
      onComplete();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to select network";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedId, selectChain, onComplete]);

  if (!isOpen) return null;

  // Filter to only show mainnet chains in the selection
  const mainnetChains = availableChains.filter((chain) => !chain.isTestnet);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chain-selection-title"
    >
      <Card className="w-full max-w-lg shadow-2xl rounded-2xl animate-slideIn overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h2
            id="chain-selection-title"
            className="text-2xl font-bold mb-2"
          >
            Welcome to Give Protocol
          </h2>
          <p className="text-indigo-100">
            Choose your preferred network to get started
          </p>
        </div>

        {/* Chain Options */}
        <div className="p-6 space-y-3">
          {mainnetChains.map((chain) => (
            <ChainOption
              key={chain.id}
              chain={chain}
              isSelected={selectedId === chain.id}
              onSelect={handleChainSelect}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <p className="text-xs text-gray-500 text-center mb-4">
            You can switch networks anytime from the menu
          </p>

          <Button
            onClick={handleContinue}
            disabled={!selectedId || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

interface ChainOptionProps {
  chain: ChainConfig;
  isSelected: boolean;
  onSelect: (_e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Individual chain option button
 */
const ChainOption: React.FC<ChainOptionProps> = ({
  chain,
  isSelected,
  onSelect,
}) => (
  <button
    type="button"
    onClick={onSelect}
    data-chain-id={chain.id}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
        isSelected
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {/* Chain Icon */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
        style={{ backgroundColor: chain.color }}
      >
        {chain.shortName.charAt(0).toUpperCase()}
      </div>

      {/* Chain Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{chain.name}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${chain.color}20`,
              color: chain.color,
            }}
          >
            {chain.ecosystem}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {getChainDescription(chain.id)}
        </p>
      </div>

      {/* Selection Indicator */}
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
        }`}
      >
        {isSelected && <Check className="w-4 h-4 text-white" />}
      </div>
    </button>
);

/**
 * Get description for a chain
 */
function getChainDescription(chainId: number): string {
  const descriptions: Record<number, string> = {
    8453: "Best for Coinbase users. Low fees, fast transactions.",
    10: "Ethereum Layer 2 with strong DeFi ecosystem.",
    1284: "Polkadot ecosystem with cross-chain compatibility.",
  };
  return descriptions[chainId] || "Blockchain network";
}
