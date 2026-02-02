import { ENV } from "./env";

export const SUPPORTED_NETWORKS = {
  POLKADOT: "polkadot",
  KUSAMA: "kusama",
  WESTEND: "westend",
  ROCOCO: "rococo",
  MOONBASE: "moonbase",
  LOCAL: "local",
} as const;

// Change default to Moonbase Alpha
export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.MOONBASE;

export const NETWORK_ENDPOINTS = {
  [SUPPORTED_NETWORKS.LOCAL]: "ws://127.0.0.1:9944",
  [SUPPORTED_NETWORKS.WESTEND]: "wss://westend-rpc.polkadot.io",
  [SUPPORTED_NETWORKS.ROCOCO]: "wss://rococo-rpc.polkadot.io",
  [SUPPORTED_NETWORKS.KUSAMA]: "wss://kusama-rpc.polkadot.io",
  [SUPPORTED_NETWORKS.POLKADOT]: "wss://rpc.polkadot.io",
  [SUPPORTED_NETWORKS.MOONBASE]: "wss://wss.api.moonbase.moonbeam.network",
} as const;

export const CHAIN_IDS = {
  // Testnets
  BASE_SEPOLIA: 84532,
  OPTIMISM_SEPOLIA: 11155420,
  MOONBASE: 1287,
  // Mainnets
  BASE: 8453,
  OPTIMISM: 10,
  MOONBEAM: 1284,
  // Legacy (to be removed)
  ASTAR: 592,
  POLYGON: 137,
} as const;

export type ChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

/**
 * Chain configuration for UI and wallet interactions
 */
export interface ChainConfig {
  id: ChainId;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconPath: string;
  color: string;
  ecosystem: string;
  isTestnet: boolean;
}

/**
 * Full chain configurations for supported networks
 */
export const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  // ========== TESTNETS ==========
  [CHAIN_IDS.BASE_SEPOLIA]: {
    id: CHAIN_IDS.BASE_SEPOLIA,
    name: "Base Sepolia",
    shortName: "base-sepolia",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
    iconPath: "/chains/base.svg",
    color: "#0052FF",
    ecosystem: "Coinbase",
    isTestnet: true,
  },
  [CHAIN_IDS.OPTIMISM_SEPOLIA]: {
    id: CHAIN_IDS.OPTIMISM_SEPOLIA,
    name: "Optimism Sepolia",
    shortName: "op-sepolia",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.optimism.io"],
    blockExplorerUrls: ["https://sepolia-optimistic.etherscan.io"],
    iconPath: "/chains/optimism.svg",
    color: "#FF0420",
    ecosystem: "Ethereum L2",
    isTestnet: true,
  },
  [CHAIN_IDS.MOONBASE]: {
    id: CHAIN_IDS.MOONBASE,
    name: "Moonbase Alpha",
    shortName: "moonbase",
    nativeCurrency: { name: "DEV", symbol: "DEV", decimals: 18 },
    rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
    blockExplorerUrls: ["https://moonbase.moonscan.io"],
    iconPath: "/chains/moonbeam.svg",
    color: "#53CBC8",
    ecosystem: "Polkadot",
    isTestnet: true,
  },

  // ========== MAINNETS ==========
  [CHAIN_IDS.BASE]: {
    id: CHAIN_IDS.BASE,
    name: "Base",
    shortName: "base",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
    iconPath: "/chains/base.svg",
    color: "#0052FF",
    ecosystem: "Coinbase",
    isTestnet: false,
  },
  [CHAIN_IDS.OPTIMISM]: {
    id: CHAIN_IDS.OPTIMISM,
    name: "Optimism",
    shortName: "optimism",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
    iconPath: "/chains/optimism.svg",
    color: "#FF0420",
    ecosystem: "Ethereum L2",
    isTestnet: false,
  },
  [CHAIN_IDS.MOONBEAM]: {
    id: CHAIN_IDS.MOONBEAM,
    name: "Moonbeam",
    shortName: "moonbeam",
    nativeCurrency: { name: "Glimmer", symbol: "GLMR", decimals: 18 },
    rpcUrls: ["https://rpc.api.moonbeam.network"],
    blockExplorerUrls: ["https://moonscan.io"],
    iconPath: "/chains/moonbeam.svg",
    color: "#53CBC8",
    ecosystem: "Polkadot",
    isTestnet: false,
  },

  // ========== LEGACY (placeholders) ==========
  [CHAIN_IDS.ASTAR]: {
    id: CHAIN_IDS.ASTAR,
    name: "Astar",
    shortName: "astar",
    nativeCurrency: { name: "Astar", symbol: "ASTR", decimals: 18 },
    rpcUrls: ["https://evm.astar.network"],
    blockExplorerUrls: ["https://astar.subscan.io"],
    iconPath: "/chains/astar.svg",
    color: "#00BFFF",
    ecosystem: "Polkadot",
    isTestnet: false,
  },
  [CHAIN_IDS.POLYGON]: {
    id: CHAIN_IDS.POLYGON,
    name: "Polygon",
    shortName: "polygon",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
    iconPath: "/chains/polygon.svg",
    color: "#8247E5",
    ecosystem: "Polygon",
    isTestnet: false,
  },
};

/**
 * Primary supported chains for Give Protocol
 */
export const SUPPORTED_CHAIN_IDS: ChainId[] = [
  CHAIN_IDS.BASE,
  CHAIN_IDS.OPTIMISM,
  CHAIN_IDS.MOONBEAM,
];

/**
 * Testnet chain IDs
 */
export const TESTNET_CHAIN_IDS: ChainId[] = [
  CHAIN_IDS.BASE_SEPOLIA,
  CHAIN_IDS.OPTIMISM_SEPOLIA,
  CHAIN_IDS.MOONBASE,
];

/**
 * Default chain for new users
 */
export const DEFAULT_CHAIN_ID = CHAIN_IDS.BASE;

/**
 * Get chain config by ID
 */
export function getChainConfig(chainId: ChainId): ChainConfig | undefined {
  return CHAIN_CONFIGS[chainId];
}

/**
 * Check if chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in CHAIN_CONFIGS;
}

/**
 * Get available chains based on environment
 */
export function getAvailableChains(showTestnets: boolean): ChainConfig[] {
  const mainnetChains = SUPPORTED_CHAIN_IDS.map((id) => CHAIN_CONFIGS[id]);
  if (showTestnets) {
    const testnetChains = TESTNET_CHAIN_IDS.map((id) => CHAIN_CONFIGS[id]);
    return [...mainnetChains, ...testnetChains];
  }
  return mainnetChains;
}

// Contract addresses for each network
export const CONTRACT_ADDRESSES: Record<
  ChainId,
  {
    DONATION: string | undefined;
    VERIFICATION: string | undefined;
    DISTRIBUTION: string | undefined;
    TOKEN: string | undefined;
    PORTFOLIO_FUNDS: string | undefined;
    EXECUTOR: string | undefined;
  }
> = {
  // Testnets
  [CHAIN_IDS.BASE_SEPOLIA]: {
    DONATION: undefined,
    VERIFICATION: undefined,
    DISTRIBUTION: undefined,
    TOKEN: undefined,
    PORTFOLIO_FUNDS: undefined,
    EXECUTOR: undefined,
  },
  [CHAIN_IDS.OPTIMISM_SEPOLIA]: {
    DONATION: undefined,
    VERIFICATION: undefined,
    DISTRIBUTION: undefined,
    TOKEN: undefined,
    PORTFOLIO_FUNDS: undefined,
    EXECUTOR: undefined,
  },
  [CHAIN_IDS.MOONBASE]: {
    DONATION: ENV.DONATION_CONTRACT_ADDRESS,
    VERIFICATION: ENV.VERIFICATION_CONTRACT_ADDRESS,
    DISTRIBUTION: ENV.DISTRIBUTION_CONTRACT_ADDRESS,
    TOKEN: ENV.TOKEN_CONTRACT_ADDRESS,
    PORTFOLIO_FUNDS: ENV.PORTFOLIO_FUNDS_CONTRACT_ADDRESS,
    EXECUTOR: ENV.EXECUTOR_CONTRACT_ADDRESS,
  },
  // Mainnets
  [CHAIN_IDS.BASE]: {
    DONATION: undefined,
    VERIFICATION: undefined,
    DISTRIBUTION: undefined,
    TOKEN: undefined,
    PORTFOLIO_FUNDS: undefined,
    EXECUTOR: undefined,
  },
  [CHAIN_IDS.OPTIMISM]: {
    DONATION: undefined,
    VERIFICATION: undefined,
    DISTRIBUTION: undefined,
    TOKEN: undefined,
    PORTFOLIO_FUNDS: undefined,
    EXECUTOR: undefined,
  },
  [CHAIN_IDS.MOONBEAM]: {
    DONATION: undefined,
    VERIFICATION: undefined,
    DISTRIBUTION: undefined,
    TOKEN: undefined,
    PORTFOLIO_FUNDS: undefined,
    EXECUTOR: undefined,
  },
  // Legacy
  [CHAIN_IDS.ASTAR]: {
    DONATION: undefined,
    VERIFICATION: undefined,
    DISTRIBUTION: undefined,
    TOKEN: undefined,
    PORTFOLIO_FUNDS: undefined,
    EXECUTOR: undefined,
  },
  [CHAIN_IDS.POLYGON]: {
    DONATION: undefined,
    VERIFICATION: undefined,
    DISTRIBUTION: undefined,
    TOKEN: undefined,
    PORTFOLIO_FUNDS: undefined,
    EXECUTOR: undefined,
  },
};

// Helper to get contract address for current network
export function getContractAddress(
  contractName: keyof (typeof CONTRACT_ADDRESSES)[typeof CHAIN_IDS.MOONBASE],
  chainId: ChainId = CHAIN_IDS.MOONBASE,
): string {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`No contract addresses found for chain ID ${chainId}`);
  }

  const address = addresses[contractName];
  if (!address) {
    // For development/test environments, return a dummy address
    const isDev = typeof import.meta !== "undefined" && import.meta.env?.DEV;
    const isTest =
      typeof process !== "undefined" && process.env?.NODE_ENV === "test";
    if (isDev || isTest) {
      // skipcq: SCT-A000 - This is a placeholder development Ethereum address, not a real secret
      return "0x1234567890123456789012345678901234567890";
    }
    throw new Error(
      `${contractName} contract not deployed on chain ID ${chainId}`,
    );
  }

  return address;
}
