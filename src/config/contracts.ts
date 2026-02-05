import {
  getChainContractAddresses,
  type ChainContractAddresses,
} from "@/config/env";

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

// Contract addresses loaded from environment variables per chain
export const CONTRACT_ADDRESSES: Record<ChainId, ChainContractAddresses> = {
  // Testnets
  [CHAIN_IDS.BASE_SEPOLIA]: getChainContractAddresses(CHAIN_IDS.BASE_SEPOLIA),
  [CHAIN_IDS.OPTIMISM_SEPOLIA]: getChainContractAddresses(
    CHAIN_IDS.OPTIMISM_SEPOLIA,
  ),
  [CHAIN_IDS.MOONBASE]: getChainContractAddresses(CHAIN_IDS.MOONBASE),
  // Mainnets
  [CHAIN_IDS.BASE]: getChainContractAddresses(CHAIN_IDS.BASE),
  [CHAIN_IDS.OPTIMISM]: getChainContractAddresses(CHAIN_IDS.OPTIMISM),
  [CHAIN_IDS.MOONBEAM]: getChainContractAddresses(CHAIN_IDS.MOONBEAM),
};

/**
 * Get contract address for a specific contract on a specific chain
 * @param contractName - The contract name (DONATION, VERIFICATION, etc.)
 * @param chainId - The chain ID (defaults to Moonbase for backward compat)
 * @returns The contract address string
 */
export function getContractAddress(
  contractName: keyof ChainContractAddresses,
  chainId: ChainId = CHAIN_IDS.MOONBASE,
): string {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`No contract addresses found for chain ID ${chainId}`);
  }

  const address = addresses[contractName];
  if (!address) {
    // For development/test environments, return a dummy address
    const nodeEnv =
      typeof process !== "undefined" ? process.env?.NODE_ENV : undefined;
    if (nodeEnv !== "production") {
      // skipcq: SCT-A000 - This is a placeholder development Ethereum address, not a real secret
      return "0x1234567890123456789012345678901234567890";
    }
    throw new Error(
      `${contractName} contract not deployed on chain ID ${chainId}`,
    );
  }

  return address;
}
