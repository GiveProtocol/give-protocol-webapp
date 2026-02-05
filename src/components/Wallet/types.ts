/**
 * TypeScript interfaces for Give Protocol wallet components
 */

/**
 * Supported wallet provider types
 */
export type WalletProviderType =
  | "polkadot-js"
  | "talisman"
  | "subwallet"
  | "nova"
  | "metamask";

/**
 * Supported network types
 */
export type NetworkType =
  | "base"
  | "optimism"
  | "moonbeam"
  | "base-sepolia"
  | "optimism-sepolia"
  | "moonbase";

/**
 * Wallet balance information
 */
export interface WalletBalances {
  /** Native token balance (DOT, KSM, GLMR, DEV) */
  native?: string;
  /** GLMR balance (for Moonbeam) */
  glmr?: string;
  /** Total USD value of all balances */
  usdValue?: string;
  /** Loading state for balance fetching */
  isLoading?: boolean;
}

/**
 * Props for the main WalletButton component
 */
export interface WalletButtonProps {
  /** Connected wallet address */
  address: string;
  /** Wallet provider being used */
  provider: WalletProviderType;
  /** Current network */
  network: NetworkType;
  /** Callback when user disconnects wallet */
  onDisconnect: () => void;
  /** Callback when user wants to switch accounts */
  onSwitchAccount: () => void;
  /** Callback when network is changed */
  onNetworkChange: (_network: NetworkType) => void;
  /** Number of pending transactions (optional) */
  pendingTxCount?: number;
  /** Wallet balances (optional - will fetch if not provided) */
  balances?: WalletBalances;
  /** Additional CSS classes */
  className?: string;
  /** Whether multiple accounts are available for switching */
  hasMultipleAccounts?: boolean;
}

/**
 * Internal state for WalletButton component
 */
export interface WalletButtonState {
  /** Whether dropdown menu is open */
  isDropdownOpen: boolean;
  /** Whether address was recently copied */
  copied: boolean;
  /** Number of pending transactions */
  pendingTransactions: number;
  /** Wallet balances */
  balances: WalletBalances;
}

/**
 * Props for the WalletDropdown component
 */
export interface WalletDropdownProps {
  /** Connected wallet address */
  address: string;
  /** Wallet provider name */
  provider: WalletProviderType;
  /** Current network */
  network: NetworkType;
  /** Wallet balances */
  balances: WalletBalances;
  /** Whether address was recently copied */
  copied: boolean;
  /** Callback when copy button is clicked */
  onCopy: () => void;
  /** Callback when disconnect is clicked */
  onDisconnect: () => void;
  /** Callback when switch account is clicked */
  onSwitchAccount: () => void;
  /** Callback when settings is clicked */
  onSettings: () => void;
  /** Whether multiple accounts are available */
  hasMultipleAccounts?: boolean;
}

/**
 * Props for the NetworkSelector component
 */
export interface NetworkSelectorProps {
  /** Currently selected network */
  currentNetwork: NetworkType;
  /** Callback when network is changed */
  onNetworkChange: (_network: NetworkType) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether selector is disabled */
  disabled?: boolean;
}

/**
 * Network configuration for display
 */
export interface NetworkConfig {
  /** Network identifier */
  id: NetworkType;
  /** Display name */
  name: string;
  /** Token symbol */
  token: string;
  /** Network icon/color for display */
  color: string;
}

/**
 * Available networks configuration
 */
export const NETWORKS: NetworkConfig[] = [
  // Mainnets
  { id: "base", name: "Base", token: "ETH", color: "#0052FF" },
  { id: "optimism", name: "Optimism", token: "ETH", color: "#FF0420" },
  { id: "moonbeam", name: "Moonbeam", token: "GLMR", color: "#53CBC8" },
  // Testnets
  { id: "base-sepolia", name: "Base Sepolia", token: "ETH", color: "#0052FF" },
  {
    id: "optimism-sepolia",
    name: "OP Sepolia",
    token: "ETH",
    color: "#FF0420",
  },
  { id: "moonbase", name: "Moonbase Alpha", token: "DEV", color: "#53CBC8" },
];

/**
 * Props for WalletAvatar component
 */
export interface WalletAvatarProps {
  /** Wallet address for gradient generation */
  address: string;
  /** Size of avatar in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for ConnectionStatus indicator
 */
export interface ConnectionStatusProps {
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether there's a pending connection */
  isPending?: boolean;
  /** Size of indicator ('sm' | 'md') */
  size?: "sm" | "md";
}
