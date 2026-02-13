/**
 * Coinbase Wallet Provider
 * Multi-chain wallet supporting EVM and Solana chains
 */

import { Logger } from "@/utils/logger";
import type {
  ChainType,
  UnifiedAccount,
  WalletCategory,
} from "@/types/wallet";
import { EVMAdapter, isEIP1193Provider } from "../adapters/EVMAdapter";
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
      typeof window.ethereum !== "undefined" && window.ethereum.isCoinbaseWallet;

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
   * Connect to Coinbase Wallet
   * @param chainType - Chain type to connect (defaults to EVM)
   * @returns Array of connected accounts
   */
  async connect(chainType: ChainType = "evm"): Promise<UnifiedAccount[]> {
    if (!this.isInstalled()) {
      throw new Error("Coinbase Wallet is not installed");
    }

    const accounts: UnifiedAccount[] = [];

    try {
      if (chainType === "evm") {
        const evmAccounts = await this.connectEVM();
        accounts.push(...evmAccounts);
        this.connectedChainType = "evm";
      }

      if (chainType === "solana") {
        if (!this.hasSolanaSupport()) {
          throw new Error("Coinbase Wallet Solana support not available");
        }
        const solanaAccounts = await this.connectSolana();
        accounts.push(...solanaAccounts);
        this.connectedChainType = "solana";
      }

      if (accounts.length === 0) {
        throw new Error("No accounts connected");
      }

      Logger.info("Coinbase Wallet connected", {
        chainType,
        accountCount: accounts.length,
      });

      return accounts;
    } catch (error) {
      Logger.error("Coinbase Wallet connection failed", { error, chainType });
      throw error;
    }
  }

  /**
   * Connect to Coinbase EVM provider
   * Defaults to Base chain for optimal Coinbase experience
   * @returns Array of EVM accounts
   */
  private async connectEVM(): Promise<UnifiedAccount[]> {
    const evmProvider = this.getEVMProvider();
    if (!evmProvider || !isEIP1193Provider(evmProvider)) {
      throw new Error("Coinbase Wallet EVM provider not available");
    }

    this.evmAdapter = new EVMAdapter(evmProvider);

    // Default to Base chain for Coinbase Wallet users
    const preferredChainId = EVM_CHAIN_IDS.BASE;

    return this.evmAdapter.connect(preferredChainId);
  }

  /**
   * Connect to Coinbase Solana provider
   * @returns Array of Solana accounts
   */
  private async connectSolana(): Promise<UnifiedAccount[]> {
    const solanaProvider = this.getSolanaProvider();
    if (!solanaProvider || !isSolanaProvider(solanaProvider)) {
      throw new Error("Coinbase Wallet Solana provider not available");
    }

    this.solanaAdapter = new SolanaAdapter(solanaProvider, DEFAULT_SOLANA_CLUSTER);
    return this.solanaAdapter.connect();
  }

  /**
   * Get Coinbase EVM provider from window
   */
  private getEVMProvider(): unknown {
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
