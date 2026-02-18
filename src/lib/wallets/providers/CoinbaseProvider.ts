/**
 * Coinbase Wallet Provider
 * Multi-chain wallet supporting EVM and Solana chains
 */

import type {
  ChainType,
  WalletCategory,
  UnifiedAccount,
} from "@/types/wallet";
import { SolanaAdapter, isSolanaProvider } from "../adapters/SolanaAdapter";
import { DEFAULT_SOLANA_CLUSTER, EVM_CHAIN_IDS } from "@/config/chains";
import { BaseMultiChainProvider, type SecondaryChainAdapter } from "./BaseMultiChainProvider";

/**
 * CoinbaseProvider - Multi-chain wallet for EVM and Solana
 * Coinbase Wallet is the recommended wallet for Base chain with expanding multi-chain support
 */
export class CoinbaseProvider extends BaseMultiChainProvider {
  readonly name = "Coinbase Wallet";
  readonly icon = "coinbase";
  readonly category: WalletCategory = "multichain";
  readonly supportedChainTypes: ChainType[] = ["evm", "solana"];

  private solanaAdapter: SolanaAdapter | null = null;

  protected get secondaryChainType(): ChainType {
    return "solana";
  }

  /**
   * Get underlying provider objects
   */
  get providers() {
    return {
      evm: this.getEVMProvider(),
      solana: this.getSolanaProvider(),
    };
  }

  protected getSecondaryAdapter(): SecondaryChainAdapter | null {
    return this.solanaAdapter;
  }

  protected clearSecondaryAdapter(): void {
    this.solanaAdapter = null;
  }

  /**
   * Check if Coinbase Wallet is installed
   * @returns True if Coinbase Wallet extension is available
   */
  isInstalled(): boolean {
    if (typeof window === "undefined") return false;

    // Check for Coinbase Wallet extension
    const hasCoinbaseExtension =
      typeof window.coinbaseWalletExtension !== "undefined";

    // Check for Coinbase injected into ethereum
    const hasCoinbaseInEthereum =
      typeof window.ethereum !== "undefined" && window.ethereum?.isCoinbaseWallet;

    return hasCoinbaseExtension || hasCoinbaseInEthereum;
  }

  /**
   * Check if Coinbase Solana is available
   * @returns True if Coinbase Solana provider exists
   */
  hasSolanaSupport(): boolean {
    const provider = this.getSolanaProvider();
    return isSolanaProvider(provider);
  }

  /**
   * Default to Base chain for Coinbase Wallet users
   */
  protected override defaultEVMChainId(): number {
    return EVM_CHAIN_IDS.BASE;
  }

  /**
   * Get Coinbase EVM provider from window
   */
  protected getEVMProvider(): unknown {
    if (typeof window === "undefined") return null;

    // Prefer dedicated extension
    if (window.coinbaseWalletExtension) {
      return window.coinbaseWalletExtension;
    }

    // Fall back to injected ethereum
    if (window.ethereum?.isCoinbaseWallet) {
      return window.ethereum;
    }

    return null;
  }

  /**
   * Connect to Coinbase Solana provider
   * @returns Array of Solana accounts
   */
  protected async connectSecondary(): Promise<UnifiedAccount[]> {
    if (!this.hasSolanaSupport()) {
      throw new Error("Coinbase Wallet Solana support not available");
    }

    const solanaProvider = this.getSolanaProvider();
    if (!solanaProvider || !isSolanaProvider(solanaProvider)) {
      throw new Error("Coinbase Wallet Solana provider not available");
    }

    this.solanaAdapter = new SolanaAdapter(solanaProvider, DEFAULT_SOLANA_CLUSTER);
    return this.solanaAdapter.connect();
  }

  /**
   * Get Coinbase Solana provider from window
   * Note: Coinbase Wallet may inject Solana provider differently
   */
  private getSolanaProvider(): unknown {
    if (typeof window === "undefined") return null;

    // Check for Coinbase-specific Solana provider
    const solana = (window as { solana?: { isCoinbaseWallet?: boolean } }).solana;
    if (solana?.isCoinbaseWallet) {
      return solana;
    }

    return null;
  }
}

/**
 * Create a Coinbase Wallet provider instance
 * @returns CoinbaseProvider if available, null otherwise
 */
export function createCoinbaseProvider(): CoinbaseProvider | null {
  const provider = new CoinbaseProvider();
  return provider.isInstalled() ? provider : null;
}
