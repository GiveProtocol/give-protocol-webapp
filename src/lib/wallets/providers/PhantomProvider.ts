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

  protected readonly secondaryChainType: ChainType = "solana";

  /**
   * Get underlying provider objects
   */
  get providers() {
    return {
      evm: this.getEVMProvider(),
      solana: PhantomProvider.getSolanaProvider(),
    };
  }

  /** @returns The Solana adapter instance, or null if not connected */
  protected getSecondaryAdapter(): SecondaryChainAdapter | null {
    return this.solanaAdapter;
  }

  /** Clears the Solana adapter reference during disconnect */
  protected clearSecondaryAdapter(): void {
    this.solanaAdapter = null;
  }

  /**
   * Check if Phantom is installed
   * @returns True if Phantom extension is available
   */
  isInstalled(): boolean {
    if (this.supportedChainTypes.length === 0) return false;
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
    if (!this.isInstalled()) return null;
    const phantom = (window as { phantom?: { ethereum?: unknown } }).phantom;
    return phantom?.ethereum ?? null;
  }

  /**
   * Connect to Phantom Solana provider
   * @returns Array of Solana accounts
   */
  protected async connectSecondary(): Promise<UnifiedAccount[]> {
    const solanaProvider = PhantomProvider.getSolanaProvider();
    if (!solanaProvider || !isSolanaProvider(solanaProvider)) {
      throw new Error("Phantom Solana provider not available");
    }

    this.solanaAdapter = new SolanaAdapter(solanaProvider, DEFAULT_SOLANA_CLUSTER);
    return await this.solanaAdapter.connect();
  }

  /**
   * Get Phantom Solana provider from window
   */
  private static getSolanaProvider(): unknown {
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
