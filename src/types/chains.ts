/**
 * Multi-chain configuration types for Give Protocol
 * Supports EVM, Solana, and Polkadot chain families
 */

import type { ChainType } from "./wallet";

/**
 * Base chain configuration shared across all chain types
 */
export interface BaseChainConfig {
  /** Unique chain identifier */
  id: number | string;
  /** Chain type */
  type: ChainType;
  /** Human-readable chain name */
  name: string;
  /** Short chain name/slug */
  shortName: string;
  /** Whether this is a testnet */
  isTestnet: boolean;
  /** Path to chain icon */
  iconPath: string;
  /** Primary brand color */
  color: string;
  /** Chain description */
  description: string;
}

/**
 * Native currency configuration
 */
export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

/**
 * EVM-specific chain configuration
 */
export interface EVMChainConfig extends BaseChainConfig {
  type: "evm";
  id: number;
  /** Native currency details */
  nativeCurrency: NativeCurrency;
  /** RPC endpoint URLs */
  rpcUrls: string[];
  /** Block explorer URLs */
  blockExplorerUrls: string[];
  /** Ecosystem identifier (e.g., "Ethereum L2", "Polkadot") */
  ecosystem: string;
}

/**
 * Solana cluster configuration
 */
export interface SolanaClusterConfig extends BaseChainConfig {
  type: "solana";
  id: string;
  /** Cluster name (mainnet-beta, devnet, testnet, localnet) */
  cluster: "mainnet-beta" | "devnet" | "testnet" | "localnet";
  /** RPC endpoint URL */
  rpcUrl: string;
  /** WebSocket endpoint URL */
  wsUrl: string;
  /** Block explorer URL */
  explorerUrl: string;
}

/**
 * Polkadot/Substrate chain configuration
 */
export interface PolkadotChainConfig extends BaseChainConfig {
  type: "polkadot";
  id: string;
  /** SS58 address prefix */
  ss58Prefix: number;
  /** WebSocket RPC endpoint */
  wsEndpoint: string;
  /** Native token details */
  nativeToken: NativeCurrency;
  /** Block explorer URL */
  explorerUrl: string;
  /** Parachain ID (if applicable) */
  parachainId?: number;
  /** Relay chain (polkadot, kusama, westend) */
  relayChain?: string;
}

/**
 * Union type for all chain configurations
 */
export type AnyChainConfig = EVMChainConfig | SolanaClusterConfig | PolkadotChainConfig;

/**
 * Multi-chain registry holding all chain configurations
 */
export interface ChainRegistry {
  evm: Record<number, EVMChainConfig>;
  solana: Record<string, SolanaClusterConfig>;
  polkadot: Record<string, PolkadotChainConfig>;
}

/**
 * Type guard to check if config is EVM
 * @param config - Chain configuration to check
 * @returns True if EVM chain
 */
export function isEVMChain(config: AnyChainConfig): config is EVMChainConfig {
  return config.type === "evm";
}

/**
 * Type guard to check if config is Solana
 * @param config - Chain configuration to check
 * @returns True if Solana chain
 */
export function isSolanaChain(config: AnyChainConfig): config is SolanaClusterConfig {
  return config.type === "solana";
}

/**
 * Type guard to check if config is Polkadot
 * @param config - Chain configuration to check
 * @returns True if Polkadot chain
 */
export function isPolkadotChain(config: AnyChainConfig): config is PolkadotChainConfig {
  return config.type === "polkadot";
}
