/**
 * Coinbase Wallet Provider
 * Multi-chain wallet supporting EVM and Solana chains
 */

import { Logger } from "@/utils/logger";
import type {
  ChainType,
  UnifiedAccount,
  UnifiedWalletProvider,
  UnifiedTransactionRequest,
  WalletCategory,
} from "@/types/wallet";
import { EVMAdapter, isEIP1193Provider } from "../adapters/EVMAdapter";
import { SolanaAdapter, isSolanaProvider } from "../adapters/SolanaAdapter";
import { DEFAULT_SOLANA_CLUSTER, EVM_CHAIN_IDS } from "@/config/chains";

/**
 * CoinbaseProvider - Multi-chain wallet for EVM and Solana
 * Coinbase Wallet is the recommended wallet for Base chain with expanding multi-chain support
 */
export class CoinbaseProvider implements UnifiedWalletProvider {
  readonly name = "Coinbase Wallet";
  readonly icon = "coinbase";
  readonly category: WalletCategory = "multichain";
  readonly supportedChainTypes: ChainType[] = ["evm", "solana"];

  private evmAdapter: EVMAdapter | null = null;
  private solanaAdapter: SolanaAdapter | null = null;
  private connectedChainType: ChainType | null = null;

  /**
   * Get underlying provider objects
   */
  get providers() {
    return {
      evm: this.getEVMProvider(),
      solana: this.getSolanaProvider(),
    };
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
   * Disconnect from Coinbase Wallet
   */
  async disconnect(): Promise<void> {
    try {
      if (this.evmAdapter) {
        await this.evmAdapter.disconnect();
        this.evmAdapter = null;
      }

      if (this.solanaAdapter) {
        await this.solanaAdapter.disconnect();
        this.solanaAdapter = null;
      }

      this.connectedChainType = null;
      Logger.info("Coinbase Wallet disconnected");
    } catch (error) {
      Logger.error("Coinbase Wallet disconnect failed", { error });
      throw error;
    }
  }

  /**
   * Get accounts from Coinbase Wallet
   * @param chainType - Optional chain type filter
   * @returns Array of accounts
   */
  async getAccounts(chainType?: ChainType): Promise<UnifiedAccount[]> {
    const accounts: UnifiedAccount[] = [];

    if ((!chainType || chainType === "evm") && this.evmAdapter) {
      const evmAccounts = await this.evmAdapter.getAccounts();
      accounts.push(...evmAccounts);
    }

    if ((!chainType || chainType === "solana") && this.solanaAdapter) {
      const solanaAccounts = await this.solanaAdapter.getAccounts();
      accounts.push(...solanaAccounts);
    }

    return accounts;
  }

  /**
   * Switch to a different chain
   * @param chainId - Target chain ID
   * @param chainType - Chain type
   */
  async switchChain(chainId: number | string, chainType: ChainType): Promise<void> {
    if (chainType === "evm" && this.evmAdapter) {
      await this.evmAdapter.switchChain(chainId as number);
    } else if (chainType === "solana" && this.solanaAdapter) {
      await this.solanaAdapter.switchCluster(chainId as string);
    } else {
      throw new Error(`Cannot switch chain for ${chainType}`);
    }
  }

  /**
   * Sign a transaction
   * @param tx - Transaction request
   * @returns Transaction hash or signature
   */
  async signTransaction(tx: UnifiedTransactionRequest): Promise<string> {
    if (tx.chainType === "evm" && this.evmAdapter) {
      return this.evmAdapter.signTransaction(tx);
    }

    if (tx.chainType === "solana" && this.solanaAdapter) {
      return this.solanaAdapter.signTransaction(tx);
    }

    throw new Error(`Cannot sign transaction for ${tx.chainType}`);
  }

  /**
   * Sign a message
   * @param message - Message to sign
   * @param chainType - Chain type for signing
   * @returns Signature
   */
  async signMessage(message: string | Uint8Array, chainType: ChainType): Promise<string> {
    if (chainType === "evm" && this.evmAdapter) {
      return this.evmAdapter.signMessage(message);
    }

    if (chainType === "solana" && this.solanaAdapter) {
      return this.solanaAdapter.signMessage(message);
    }

    throw new Error(`Cannot sign message for ${chainType}`);
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
