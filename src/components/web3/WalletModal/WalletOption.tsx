/**
 * WalletOption - Individual wallet option with chain badges
 * Displays a wallet provider with its supported chains
 */

import React, { useCallback, useMemo } from "react";
import { Loader2, ExternalLink, Download, Clock } from "lucide-react";
import type { ChainType, UnifiedWalletProvider } from "@/types/wallet";

/**
 * Wallets with "Coming Soon" support for specific chains
 * Maps wallet name to array of chain types that are not yet fully implemented
 */
const COMING_SOON_CHAINS: Record<string, ChainType[]> = {
  Ledger: ["polkadot", "solana"],
};

/**
 * Install URLs for wallets
 */
const WALLET_INSTALL_URLS: Record<string, string> = {
  MetaMask: "https://metamask.io/download/",
  Rabby: "https://rabby.io/",
  Phantom: "https://phantom.app/download",
  Talisman: "https://talisman.xyz/download",
  SubWallet: "https://subwallet.app/download",
  "Coinbase Wallet": "https://www.coinbase.com/wallet/downloads",
  Ledger: "https://www.ledger.com/start",
};

/**
 * Chain badge colors
 */
const CHAIN_COLORS: Record<ChainType, { bg: string; text: string }> = {
  evm: { bg: "bg-blue-100", text: "text-blue-700" },
  solana: { bg: "bg-purple-100", text: "text-purple-700" },
  polkadot: { bg: "bg-pink-100", text: "text-pink-700" },
};

/**
 * Chain badge labels
 */
const CHAIN_LABELS: Record<ChainType, string> = {
  evm: "EVM",
  solana: "Solana",
  polkadot: "Polkadot",
};

interface ChainBadgeProps {
  chainType: ChainType;
}

/**
 * Small badge showing chain type support
 * @param chainType - Chain type to display
 */
const ChainBadge: React.FC<ChainBadgeProps> = ({ chainType }) => {
  const colors = CHAIN_COLORS[chainType];

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {CHAIN_LABELS[chainType]}
    </span>
  );
};

interface WalletOptionProps {
  wallet: UnifiedWalletProvider;
  selectedChainType: ChainType;
  isConnecting: boolean;
  connectingWallet: string | null;
  onSelect: (_wallet: UnifiedWalletProvider) => void;
}

/**
 * WalletOption Component
 * Displays a single wallet option with icon, name, and chain badges
 * @param wallet - Wallet provider to display
 * @param isConnecting - Whether a connection is in progress
 * @param connectingWallet - Name of wallet currently connecting
 * @param onSelect - Callback when wallet is selected
 */
export const WalletOption: React.FC<WalletOptionProps> = ({
  wallet,
  selectedChainType,
  isConnecting,
  connectingWallet,
  onSelect,
}) => {
  const isThisConnecting = connectingWallet === wallet.name;
  const isInstalled = wallet.isInstalled();
  const installUrl = WALLET_INSTALL_URLS[wallet.name];

  // Check if this wallet has "Coming Soon" support for the selected chain
  const isComingSoon = useMemo(() => {
    const comingSoonChains = COMING_SOON_CHAINS[wallet.name];
    return comingSoonChains?.includes(selectedChainType) ?? false;
  }, [wallet.name, selectedChainType]);

  const isDisabled = (isConnecting && !isThisConnecting) || isComingSoon;

  const handleClick = useCallback(() => {
    if (isInstalled && !isDisabled && !isThisConnecting && !isComingSoon) {
      onSelect(wallet);
    }
  }, [wallet, onSelect, isDisabled, isThisConnecting, isInstalled, isComingSoon]);

  const handleInstallClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (installUrl) {
      window.open(installUrl, "_blank", "noopener,noreferrer");
    }
  }, [installUrl]);

  const handleIconError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/icons/wallet.svg";
  }, []);

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled || isComingSoon || (!isInstalled && !installUrl)}
      className={`
        flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors
        ${isDisabled || isComingSoon ? "opacity-50 cursor-not-allowed" : ""}
        ${!isInstalled && !isComingSoon ? "opacity-75" : ""}
        ${!isDisabled && !isComingSoon && isInstalled ? "hover:bg-gray-50 cursor-pointer" : ""}
        ${isThisConnecting ? "bg-indigo-50" : ""}
      `}
      role="menuitem"
    >
      {/* Wallet Icon */}
      <div className="flex-shrink-0 w-10 h-10 mr-3">
        <img
          src={`/icons/${wallet.icon}.svg`}
          alt=""
          className={`w-full h-full object-contain ${!isInstalled || isComingSoon ? "grayscale" : ""}`}
          aria-hidden="true"
          onError={handleIconError}
        />
      </div>

      {/* Wallet Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${isInstalled ? "text-gray-900" : "text-gray-500"}`}>
            {wallet.name}
          </span>
          {isThisConnecting && (
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
          )}
          {isComingSoon && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-600 bg-amber-50 rounded">
              <Clock className="w-3 h-3" />
              Coming Soon
            </span>
          )}
          {!isInstalled && !isComingSoon && installUrl && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
            >
              <Download className="w-3 h-3" />
              Install
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          {!isInstalled && !isComingSoon && !installUrl && (
            <span className="text-xs text-gray-400">Not detected</span>
          )}
        </div>

        {/* Chain Badges */}
        <div className="flex flex-wrap gap-1 mt-1">
          {wallet.supportedChainTypes.map((chainType) => (
            <ChainBadge key={chainType} chainType={chainType} />
          ))}
        </div>
      </div>

      {/* Category Badge */}
      {wallet.category === "hardware" && (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">
          Hardware
        </span>
      )}
      {wallet.category === "institutional" && (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium text-green-600 bg-green-50 rounded">
          Smart Account
        </span>
      )}
    </button>
  );
};

export default WalletOption;
