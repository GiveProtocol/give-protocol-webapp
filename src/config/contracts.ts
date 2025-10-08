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
  MOONBASE: 1287, // Moonbase Alpha TestNet
  MOONBEAM: 1284, // Moonbeam Mainnet
  ASTAR: 592,
  POLYGON: 137,
} as const;

// Contract addresses for each network
export const CONTRACT_ADDRESSES: Record<
  (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS],
  {
    DONATION: string | undefined;
    VERIFICATION: string | undefined;
    DISTRIBUTION: string | undefined;
    TOKEN: string | undefined;
    PORTFOLIO_FUNDS: string | undefined;
  }
> = {
  [CHAIN_IDS.MOONBASE]: {
    DONATION: ENV.DONATION_CONTRACT_ADDRESS,
    VERIFICATION: ENV.VERIFICATION_CONTRACT_ADDRESS,
    DISTRIBUTION: ENV.DISTRIBUTION_CONTRACT_ADDRESS,
    TOKEN: ENV.TOKEN_CONTRACT_ADDRESS,
    PORTFOLIO_FUNDS: ENV.PORTFOLIO_FUNDS_CONTRACT_ADDRESS,
  },
  [CHAIN_IDS.MOONBEAM]: {
    DONATION: undefined, // To be deployed
    VERIFICATION: undefined, // To be deployed
    DISTRIBUTION: undefined, // To be deployed
    TOKEN: undefined, // To be deployed
    PORTFOLIO_FUNDS: undefined, // To be deployed
  },
  [CHAIN_IDS.ASTAR]: {
    DONATION: undefined, // To be deployed
    VERIFICATION: undefined, // To be deployed
    DISTRIBUTION: undefined, // To be deployed
    TOKEN: undefined, // To be deployed
    PORTFOLIO_FUNDS: undefined, // To be deployed
  },
  [CHAIN_IDS.POLYGON]: {
    DONATION: undefined, // To be deployed
    VERIFICATION: undefined, // To be deployed
    DISTRIBUTION: undefined, // To be deployed
    TOKEN: undefined, // To be deployed
    PORTFOLIO_FUNDS: undefined, // To be deployed
  },
} as const;

// Helper to get contract address for current network
export function getContractAddress(
  contractName: keyof (typeof CONTRACT_ADDRESSES)[typeof CHAIN_IDS.MOONBASE],
  chainId: (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS] = CHAIN_IDS.MOONBASE,
): string {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`No contract addresses found for chain ID ${chainId}`);
  }

  const address = addresses[contractName];
  if (!address) {
    // For development, return a dummy address
    if (import.meta.env.DEV) {
      // skipcq: SCT-A000 - This is a placeholder development Ethereum address, not a real secret
      return "0x1234567890123456789012345678901234567890";
    }
    throw new Error(
      `${contractName} contract not deployed on chain ID ${chainId}`,
    );
  }

  return address;
}
