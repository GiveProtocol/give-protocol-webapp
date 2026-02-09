/**
 * MetaMask Wallet Provider
 * EVM-only wallet with broad chain support
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
 * MetaMaskProvider - EVM-only browser wallet
 * The most popular browser extension wallet for Ethereum and EVM chains
 */
export class MetaMaskProvider implements UnifiedWalletProvider {
  readonly name = "MetaMask";
  readonly icon = "metamask";
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
   * Check if MetaMask is installed
   * @returns True if MetaMask extension is available
   */
  isInstalled(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(window.ethereum?.isMetaMask);
  }

  /**
   * Connect to MetaMask wallet
   * @param _chainType - Chain type (only EVM supported)
   * @returns Array of connected accounts
   */
  async connect(_chainType: ChainType = "evm"): Promise<UnifiedAccount[]> {
    if (!this.isInstalled()) {
      throw new Error("MetaMask wallet is not installed");
    }

    try {
      const evmProvider = this.getEVMProvider();
      if (!evmProvider || !isEIP1193Provider(evmProvider)) {
        throw new Error("MetaMask EVM provider not available");
      }

      this.evmAdapter = new EVMAdapter(evmProvider);
      const accounts = await this.evmAdapter.connect(DEFAULT_EVM_CHAIN_ID);

      if (accounts.length === 0) {
        throw new Error("No accounts connected");
      }

      Logger.info("MetaMask connected", { accountCount: accounts.length });
      return accounts;
    } catch (error) {
      Logger.error("MetaMask connection failed", { error });
      throw error;
    }
  }

  /**
   * Disconnect from MetaMask
   */
  async disconnect(): Promise<void> {
    try {
      if (this.evmAdapter) {
        await this.evmAdapter.disconnect();
        this.evmAdapter = null;
      }
      Logger.info("MetaMask disconnected");
    } catch (error) {
      Logger.error("MetaMask disconnect failed", { error });
      throw error;
    }
  }

  /**
   * Get accounts from MetaMask
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
      throw new Error("MetaMask not connected");
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
    throw new Error(`MetaMask only supports EVM transactions`);
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
    throw new Error("MetaMask not connected");
  }

  /**
   * Get MetaMask EVM provider from window
   */
  private getEVMProvider(): unknown {
    if (typeof window === "undefined") return null;
    if (window.ethereum?.isMetaMask) {
      return window.ethereum;
    }
    return null;
  }
}

/**
 * Create a MetaMask provider instance
 * @returns MetaMaskProvider if available, null otherwise
 */
export function createMetaMaskProvider(): MetaMaskProvider | null {
  const provider = new MetaMaskProvider();
  return provider.isInstalled() ? provider : null;
}
