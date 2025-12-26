/**
 * Wallet Components for Give Protocol
 *
 * Professional wallet connection components for the Give Protocol dashboard.
 * Features gradient avatars, network selection, balance display, and wallet management.
 *
 * @example
 * ```tsx
 * import { WalletButton, NetworkSelector } from '@/components/Wallet';
 *
 * <header className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-2xl">
 *   <nav className="flex justify-between items-center">
 *     <Logo />
 *     <NavLinks />
 *     <div className="flex gap-3 items-center">
 *       <NetworkSelector
 *         currentNetwork={network}
 *         onNetworkChange={handleNetworkChange}
 *       />
 *       <WalletButton
 *         address={connectedAddress}
 *         provider={walletProvider}
 *         network={network}
 *         onDisconnect={handleDisconnect}
 *         onSwitchAccount={handleSwitchAccount}
 *         onNetworkChange={handleNetworkChange}
 *         pendingTxCount={pendingTransactions.length}
 *       />
 *     </div>
 *   </nav>
 * </header>
 * ```
 */

// Main components
export { WalletButton } from "./WalletButton";
export { WalletDropdown } from "./WalletDropdown";
export { NetworkSelector } from "./NetworkSelector";

// Types
export type {
  WalletButtonProps,
  WalletDropdownProps,
  NetworkSelectorProps,
  WalletBalances,
  WalletProviderType,
  NetworkType,
  NetworkConfig,
  WalletAvatarProps,
  ConnectionStatusProps,
} from "./types";

export { NETWORKS } from "./types";

// Utilities
export {
  formatAddress,
  getAddressGradient,
  getExplorerUrl,
  formatBalance,
  formatUsdValue,
  copyToClipboard,
  NETWORK_NAMES,
  NETWORK_TOKENS,
  PROVIDER_NAMES,
} from "./utils";
