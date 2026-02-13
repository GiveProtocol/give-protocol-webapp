/**
 * Phantom Wallet Provider
 * Multi-chain wallet supporting both EVM and Solana chains
 */

import { Logger } from "@/utils/logger";
import type {
  ChainType,
  UnifiedAccount,
  WalletCategory,
} from "@/types/wallet";
import { EVMAdapter, isEIP1193Provider } from "../adapters/EVMAdapter";
import { SolanaAdapter, isSolanaProvider } from "../adapters/SolanaAdapter";
import { DEFAULT_EVM_CHAIN_ID, DEFAULT_SOLANA_CLUSTER } from "@/config/chains";
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
   * Connect to Phantom wallet
   * @param chainType - Chain type to connect (defaults to EVM)
   * @returns Array of connected accounts
   */
  async connect(chainType: ChainType = "evm"): Promise<UnifiedAccount[]> {
    if (!this.isInstalled()) {
      throw new Error("Phantom wallet is not installed");
    }

    const accounts: UnifiedAccount[] = [];

    try {
      if (chainType === "evm" || chainType === undefined) {
        const evmAccounts = await this.connectEVM();
        accounts.push(...evmAccounts);
        this.connectedChainType = "evm";
      }

      if (chainType === "solana") {
        const solanaAccounts = await this.connectSolana();
        accounts.push(...solanaAccounts);
        this.connectedChainType = "solana";
      }

      if (accounts.length === 0) {
        throw new Error("No accounts connected");
      }

      Logger.info("Phantom connected", {
        chainType,
        accountCount: accounts.length,
      });

      return accounts;
    } catch (error) {
      Logger.error("Phantom connection failed", { error, chainType });
      throw error;
    }
  }

  /**
   * Connect to Phantom EVM provider
   * @returns Array of EVM accounts
   */
  private async connectEVM(): Promise<UnifiedAccount[]> {
    const evmProvider = this.getEVMProvider();
    if (!evmProvider || !isEIP1193Provider(evmProvider)) {
      throw new Error("Phantom EVM provider not available");
    }

    this.evmAdapter = new EVMAdapter(evmProvider);
    return this.evmAdapter.connect(DEFAULT_EVM_CHAIN_ID);
  }

  /**
   * Connect to Phantom Solana provider
   * @returns Array of Solana accounts
   */
  private async connectSolana(): Promise<UnifiedAccount[]> {
    const solanaProvider = this.getSolanaProvider();
    if (!solanaProvider || !isSolanaProvider(solanaProvider)) {
      throw new Error("Phantom Solana provider not available");
    }

    this.solanaAdapter = new SolanaAdapter(solanaProvider, DEFAULT_SOLANA_CLUSTER);
    return this.solanaAdapter.connect();
  }

  /**
   * Get Phantom EVM provider from window
   */
  private getEVMProvider(): unknown {
    if (typeof window === "undefined") return null;
    const phantom = (window as { phantom?: { ethereum?: unknown } }).phantom;
    return phantom?.ethereum ?? null;
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
