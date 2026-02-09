/**
 * Chain configuration exports for Give Protocol
 * Unified access to EVM, Solana, and Polkadot chain configurations
 */

// EVM chains
export {
  EVM_CHAIN_IDS,
  EVM_CHAIN_CONFIGS,
  SUPPORTED_EVM_CHAIN_IDS,
  TESTNET_EVM_CHAIN_IDS,
  DEFAULT_EVM_CHAIN_ID,
  getEVMChainConfig,
  isEVMChainSupported,
  getAvailableEVMChains,
  getEVMChainParams,
  type EVMChainId,
} from "./evm";

// Solana clusters
export {
  SOLANA_CLUSTERS,
  SOLANA_CLUSTER_CONFIGS,
  SUPPORTED_SOLANA_CLUSTERS,
  TESTNET_SOLANA_CLUSTERS,
  DEFAULT_SOLANA_CLUSTER,
  getSolanaClusterConfig,
  isSolanaClusterSupported,
  getAvailableSolanaClusters,
  getSolanaExplorerUrl,
  type SolanaClusterId,
} from "./solana";

// Polkadot chains
export {
  POLKADOT_CHAINS,
  POLKADOT_CHAIN_CONFIGS,
  SUPPORTED_POLKADOT_CHAINS,
  TESTNET_POLKADOT_CHAINS,
  DEFAULT_POLKADOT_CHAIN,
  getPolkadotChainConfig,
  isPolkadotChainSupported,
  getAvailablePolkadotChains,
  getPolkadotExplorerUrl,
  getChainSS58Prefix,
  type PolkadotChainId,
} from "./polkadot";

// Re-export chain types
export type {
  EVMChainConfig,
  SolanaClusterConfig,
  PolkadotChainConfig,
  AnyChainConfig,
  ChainRegistry,
} from "@/types/chains";
