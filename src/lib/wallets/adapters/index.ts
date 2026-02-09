/**
 * Chain Adapter exports for Give Protocol
 * Unified access to EVM, Solana, and Polkadot adapters
 */

// EVM Adapter
export {
  EVMAdapter,
  createEVMAdapter,
  isEIP1193Provider,
  EVM_ERROR_CODES,
} from "./EVMAdapter";

// Solana Adapter
export {
  SolanaAdapter,
  createSolanaAdapter,
  isSolanaProvider,
} from "./SolanaAdapter";

// Polkadot Adapter
export {
  PolkadotAdapter,
  enablePolkadotExtension,
  getAvailablePolkadotExtensions,
  isPolkadotExtension,
} from "./PolkadotAdapter";
