/**
 * Phantom Wallet Provider
 * Multi-chain wallet supporting both EVM and Solana chains
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
import { DEFAULT_EVM_CHAIN_ID, DEFAULT_SOLANA_CLUSTER } from "@/config/chains";

/**
 * PhantomProvider - Multi-chain wallet for EVM and Solana
 * Phantom supports both EVM-compatible chains and Solana
 */
export class PhantomProvider implements UnifiedWalletProvider {
  readonly name = "Phantom";
  readonly icon = "phantom";
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
   * Disconnect from Phantom
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
      Logger.info("Phantom disconnected");
    } catch (error) {
      Logger.error("Phantom disconnect failed", { error });
      throw error;
    }
  }

  /**
   * Get accounts from Phantom
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
