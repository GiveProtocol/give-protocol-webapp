/**
 * Rabby Wallet Provider
 * EVM-only wallet with advanced security features
 * Rabby is known for transaction simulation and security warnings
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
import { DEFAULT_EVM_CHAIN_ID } from "@/config/chains";

/**
 * RabbyProvider - EVM-only browser wallet with security features
 * Rabby provides transaction simulation and pre-signing security checks
 */
export class RabbyProvider implements UnifiedWalletProvider {
  readonly name = "Rabby";
  readonly icon = "rabby";
  readonly category: WalletCategory = "browser";
  readonly supportedChainTypes: ChainType[] = ["evm"];

  private evmAdapter: EVMAdapter | null = null;

  /**
   * Get underlying provider objects
   */
  get providers() {
    return {
      evm: this.getEVMProvider(),
    };
  }

  /**
   * Check if Rabby is installed
   * @returns True if Rabby extension is available
   */
  isInstalled(): boolean {
    if (typeof window === "undefined") return false;

    // Rabby injects as window.rabby or sets isRabby flag on window.ethereum
    const hasRabby = Boolean(
      (window as { rabby?: unknown }).rabby ||
      (window.ethereum as { isRabby?: boolean })?.isRabby,
    );

    return hasRabby;
  }

  /**
   * Connect to Rabby wallet
   * @param _chainType - Chain type (only EVM supported)
   * @returns Array of connected accounts
   */
  async connect(_chainType: ChainType = "evm"): Promise<UnifiedAccount[]> {
    if (!this.isInstalled()) {
      throw new Error("Rabby wallet is not installed");
    }

    try {
      const evmProvider = this.getEVMProvider();
      if (!evmProvider || !isEIP1193Provider(evmProvider)) {
        throw new Error("Rabby EVM provider not available");
      }

      this.evmAdapter = new EVMAdapter(evmProvider);
      const accounts = await this.evmAdapter.connect(DEFAULT_EVM_CHAIN_ID);

      if (accounts.length === 0) {
        throw new Error("No accounts connected");
      }

      Logger.info("Rabby connected", { accountCount: accounts.length });
      return accounts;
    } catch (error) {
      Logger.error("Rabby connection failed", { error });
      throw error;
    }
  }

  /**
   * Disconnect from Rabby
   */
  async disconnect(): Promise<void> {
    try {
      if (this.evmAdapter) {
        await this.evmAdapter.disconnect();
        this.evmAdapter = null;
      }
      Logger.info("Rabby disconnected");
    } catch (error) {
      Logger.error("Rabby disconnect failed", { error });
      throw error;
    }
  }

  /**
   * Get accounts from Rabby
   * @param _chainType - Optional chain type filter (only EVM supported)
   * @returns Array of accounts
   */
  async getAccounts(_chainType?: ChainType): Promise<UnifiedAccount[]> {
    if (this.evmAdapter) {
      return this.evmAdapter.getAccounts();
    }
    return [];
  }

  /**
   * Switch to a different chain
   * @param chainId - Target chain ID
   * @param _chainType - Chain type (only EVM supported)
   */
  async switchChain(
    chainId: number | string,
    _chainType: ChainType,
  ): Promise<void> {
    if (this.evmAdapter) {
      await this.evmAdapter.switchChain(chainId as number);
    } else {
      throw new Error("Rabby not connected");
    }
  }

  /**
   * Sign a transaction
   * @param tx - Transaction request
   * @returns Transaction hash
   */
  async signTransaction(tx: UnifiedTransactionRequest): Promise<string> {
    if (tx.chainType === "evm" && this.evmAdapter) {
      return this.evmAdapter.signTransaction(tx);
    }
    throw new Error(`Rabby only supports EVM transactions`);
  }

  /**
   * Sign a message
   * @param message - Message to sign
   * @param _chainType - Chain type (only EVM supported)
   * @returns Signature
   */
  async signMessage(
    message: string | Uint8Array,
    _chainType: ChainType,
  ): Promise<string> {
    if (this.evmAdapter) {
      return this.evmAdapter.signMessage(message);
    }
    throw new Error("Rabby not connected");
  }

  /**
   * Get Rabby EVM provider from window
   */
  private getEVMProvider(): unknown {
    if (typeof window === "undefined") return null;

    // Rabby can inject as window.rabby
    const rabby = (window as { rabby?: unknown }).rabby;
    if (rabby) return rabby;

    // Or it may be on window.ethereum with isRabby flag
    if ((window.ethereum as { isRabby?: boolean })?.isRabby) {
      return window.ethereum;
    }

    return null;
  }
}

/**
 * Create a Rabby provider instance
 * @returns RabbyProvider if available, null otherwise
 */
export function createRabbyProvider(): RabbyProvider | null {
  const provider = new RabbyProvider();
  return provider.isInstalled() ? provider : null;
}
