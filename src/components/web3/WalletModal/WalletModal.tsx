/**
 * WalletModal - Main wallet connection modal
 * Displays wallet options grouped by category with chain type filtering
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import type { ChainType, UnifiedWalletProvider, WalletCategory } from "@/types/wallet";
import { WalletGroup } from "./WalletGroup";
import { Logger } from "@/utils/logger";

/**
 * Chain type tab configuration
 */
const CHAIN_TABS: { type: ChainType; label: string; color: string }[] = [
  { type: "evm", label: "EVM", color: "bg-blue-600" },
  { type: "solana", label: "Solana", color: "bg-purple-600" },
  { type: "polkadot", label: "Polkadot", color: "bg-pink-600" },
];

/**
 * Category display order
 */
const CATEGORY_ORDER: WalletCategory[] = [
  "multichain",
  "browser",
  "hardware",
  "institutional",
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: UnifiedWalletProvider[];
  onConnect: (_wallet: UnifiedWalletProvider, _chainType: ChainType) => Promise<void>;
  initialChainType?: ChainType;
}

/**
 * WalletModal Component
 * Full-featured wallet selection modal with chain type tabs and grouped wallets
 * @param isOpen - Whether modal is visible
 * @param onClose - Callback to close modal
 * @param wallets - Available wallet providers
 * @param onConnect - Callback when connecting to a wallet
 * @param initialChainType - Initial selected chain type
 */
export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onConnect,
  initialChainType = "evm",
}) => {
  const [selectedChainType, setSelectedChainType] = useState<ChainType>(initialChainType);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedChainType(initialChainType);
      setIsConnecting(false);
      setConnectingWallet(null);
      setError(null);
    }
  }, [isOpen, initialChainType]);

  // Filter wallets by selected chain type
  const filteredWallets = useMemo(() => {
    return wallets.filter((w) =>
      w.supportedChainTypes.includes(selectedChainType)
    );
  }, [wallets, selectedChainType]);

  // Group wallets by category
  const groupedWallets = useMemo(() => {
    const groups: Record<WalletCategory, UnifiedWalletProvider[]> = {
      multichain: [],
      browser: [],
      hardware: [],
      institutional: [],
    };

    filteredWallets.forEach((wallet) => {
      groups[wallet.category].push(wallet);
    });

    return groups;
  }, [filteredWallets]);

  // Handle chain type tab change
  const handleChainTypeChange = useCallback((chainType: ChainType) => {
    setSelectedChainType(chainType);
    setError(null);
  }, []);

  // Handle wallet selection
  const handleSelectWallet = useCallback(
    async (wallet: UnifiedWalletProvider) => {
      setIsConnecting(true);
      setConnectingWallet(wallet.name);
      setError(null);

      try {
        await onConnect(wallet, selectedChainType);
        onClose();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Connection failed";
        setError(message);
        Logger.error("Wallet connection failed in modal", { wallet: wallet.name, error: err });
      } finally {
        setIsConnecting(false);
        setConnectingWallet(null);
      }
    },
    [onConnect, selectedChainType, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isConnecting) {
        onClose();
      }
    },
    [onClose, isConnecting]
  );

  // Handle backdrop keyboard events
  const handleBackdropKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && !isConnecting) {
        onClose();
      }
    },
    [onClose, isConnecting]
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isConnecting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, isConnecting, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 id="wallet-modal-title" className="text-lg font-semibold text-gray-900">
            Connect Wallet
          </h3>
          <button
            onClick={onClose}
            disabled={isConnecting}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chain Type Tabs */}
        <div className="flex px-6 pt-4 gap-2">
          {CHAIN_TABS.map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => handleChainTypeChange(type)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  selectedChainType === type
                    ? `${color} text-white`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Wallet Groups */}
        <div className="px-2 py-4 max-h-96 overflow-y-auto">
          {filteredWallets.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500">
                No wallets available for {selectedChainType.toUpperCase()} chains.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try selecting a different chain type.
              </p>
            </div>
          ) : (
            CATEGORY_ORDER.map((category) => (
              <WalletGroup
                key={category}
                category={category}
                wallets={groupedWallets[category]}
                selectedChainType={selectedChainType}
                isConnecting={isConnecting}
                connectingWallet={connectingWallet}
                onSelectWallet={handleSelectWallet}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-500 text-center">
            By connecting, you agree to the{" "}
            <a href="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
