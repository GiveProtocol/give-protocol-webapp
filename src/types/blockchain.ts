import { Address } from './common';

export type NetworkId = number;
export type TransactionHash = string;
export type BlockNumber = number;
export type TokenAmount = string;

export interface BlockchainConfig {
  readonly networkId: NetworkId;
  readonly rpcUrl: string;
  readonly chainId: number;
  readonly explorer: string;
  readonly SUPPORTED_NETWORKS: readonly NetworkId[];
}

export interface Transaction {
  hash: TransactionHash;
  from: Address;
  to: Address;
  value: TokenAmount;
  blockNumber: BlockNumber;
  timestamp: number;
  status: TransactionStatus;
  metadata?: Record<string, unknown>;
}

export type TransactionStatus = 
  | 'pending'
  | 'confirmed'
  | 'failed';

// Note: Unused types removed to improve code quality
// If these types are needed in the future, they can be re-added:
// - TransactionReceipt
// - TransactionEvent  
// - IWeb3Provider (renamed from Web3Provider to avoid naming conflict with React component)

export interface TransactionRequest {
  to: Address;
  value: TokenAmount;
  data?: string;
  gasLimit?: string;
  nonce?: number;
}

export interface TokenPrice {
  /** Token ID (usually CoinGecko ID) */
  tokenId: string;
  /** Price in target currency */
  price: number;
  /** Currency code (e.g., "usd", "eur") */
  currency: string;
  /** Timestamp of price fetch */
  timestamp: number;
}

export interface PriceCache {
  /** Cached prices by token ID */
  prices: Record<string, TokenPrice>;
  /** Last update timestamp */
  lastUpdate: number;
}

export interface CurrencyFormatOptions {
  /** Show currency symbol */
  showSymbol?: boolean;
  /** Number of decimal places */
  decimals?: number;
  /** Use compact notation (K, M, B) */
  compact?: boolean;
}