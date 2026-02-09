/**
 * WalletGroup - Groups wallets by category
 * Displays a titled section with wallet options
 */

import React from "react";
import type { ChainType, UnifiedWalletProvider, WalletCategory } from "@/types/wallet";
import { WalletOption } from "./WalletOption";

/**
 * Category display names
 */
const CATEGORY_LABELS: Record<WalletCategory, string> = {
  multichain: "Multi-Chain Wallets",
  browser: "Browser Wallets",
  hardware: "Hardware Wallets",
  institutional: "Smart Wallets",
};

/**
 * Category descriptions
 */
const CATEGORY_DESCRIPTIONS: Record<WalletCategory, string> = {
  multichain: "Connect to multiple blockchain networks",
  browser: "Browser extension wallets",
  hardware: "Secure hardware device wallets",
  institutional: "Multi-signature and smart contract wallets",
};

interface WalletGroupProps {
  category: WalletCategory;
  wallets: UnifiedWalletProvider[];
  selectedChainType: ChainType;
  isConnecting: boolean;
  connectingWallet: string | null;
  onSelectWallet: (_wallet: UnifiedWalletProvider) => void;
}

/**
 * WalletGroup Component
 * Renders a group of wallets under a category heading
 * @param category - Wallet category for this group
 * @param wallets - Array of wallets in this category
 * @param isConnecting - Whether a connection is in progress
 * @param connectingWallet - Name of wallet currently connecting
 * @param onSelectWallet - Callback when a wallet is selected
 */
export const WalletGroup: React.FC<WalletGroupProps> = ({
  category,
  wallets,
  selectedChainType,
  isConnecting,
  connectingWallet,
  onSelectWallet,
}) => {
  // Don't render empty groups
  if (wallets.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 last:mb-0">
      {/* Category Header */}
      <div className="px-4 py-2">
        <h4 className="text-sm font-semibold text-gray-900">
          {CATEGORY_LABELS[category]}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {CATEGORY_DESCRIPTIONS[category]}
        </p>
      </div>

      {/* Wallet Options */}
      <div className="space-y-1">
        {wallets.map((wallet) => (
          <WalletOption
            key={wallet.name}
            wallet={wallet}
            selectedChainType={selectedChainType}
            isConnecting={isConnecting}
            connectingWallet={connectingWallet}
            onSelect={onSelectWallet}
          />
        ))}
      </div>
    </div>
  );
};

export default WalletGroup;
