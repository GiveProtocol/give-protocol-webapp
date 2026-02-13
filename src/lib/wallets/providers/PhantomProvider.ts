/**
 * Phantom Wallet Provider
 * Multi-chain wallet supporting both EVM and Solana chains
 */

import type {
  ChainType,
  WalletCategory,
  UnifiedAccount,
} from "@/types/wallet";
import { SolanaAdapter, isSolanaProvider } from "../adapters/SolanaAdapter";
import { DEFAULT_SOLANA_CLUSTER } from "@/config/chains";
import { BaseMultiChainProvider, type SecondaryChainAdapter } from "./BaseMultiChainProvider";

/**
 * PhantomProvider - Multi-chain wallet for EVM and Solana
 * Phantom supports both EVM-compatible chains and Solana
 */
export class PhantomProvider extends BaseMultiChainProvider {
  readonly name = "Phantom";
  readonly icon = "phantom";
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
   * Check if Phantom is installed
   * @returns True if Phantom extension is available
   */
  isInstalled(): boolean {
    if (typeof window === "undefined") return false;

    // Check for Phantom's multi-chain providers
    const phantom = (window as { phantom?: { ethereum?: unknown; solana?: unknown } })
      .phantom;

    return Boolean(phantom?.ethereum || phantom?.solana);
  }

  /**
   * Get Phantom EVM provider from window
   */
  protected getEVMProvider(): unknown {
    if (typeof window === "undefined") return null;
    const phantom = (window as { phantom?: { ethereum?: unknown } }).phantom;
    return phantom?.ethereum ?? null;
  }

  /**
   * Connect to Phantom Solana provider
   * @returns Array of Solana accounts
   */
  protected async connectSecondary(): Promise<UnifiedAccount[]> {
    const solanaProvider = this.getSolanaProvider();
    if (!solanaProvider || !isSolanaProvider(solanaProvider)) {
      throw new Error("Phantom Solana provider not available");
    }

    this.solanaAdapter = new SolanaAdapter(solanaProvider, DEFAULT_SOLANA_CLUSTER);
    return this.solanaAdapter.connect();
  }

  /**
   * Get Phantom Solana provider from window
   */
  private getSolanaProvider(): unknown {
    if (typeof window === "undefined") return null;
    const phantom = (window as { phantom?: { solana?: unknown } }).phantom;
    return phantom?.solana ?? null;
  }
}

/**
 * Create a Phantom provider instance
 * @returns PhantomProvider if available, null otherwise
 */
export function createPhantomProvider(): PhantomProvider | null {
  const provider = new PhantomProvider();
  return provider.isInstalled() ? provider : null;
}
