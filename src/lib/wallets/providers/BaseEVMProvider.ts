/**
 * Base class for EVM-only wallet providers
 * Extracts shared logic from MetaMask and Rabby providers
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
 * BaseEVMProvider - Abstract base for EVM-only browser wallets
 * Implements connect, disconnect, getAccounts, switchChain, signTransaction, signMessage
 */
export abstract class BaseEVMProvider implements UnifiedWalletProvider {
  abstract readonly name: string;
  abstract readonly icon: string;
  readonly category: WalletCategory = "browser";
  readonly supportedChainTypes: ChainType[] = ["evm"];

  protected evmAdapter: EVMAdapter | null = null;

  get providers() {
    return {
      evm: this.getEVMProvider(),
    };
  }

  abstract isInstalled(): boolean;
  protected abstract getEVMProvider(): unknown;

  /**
   * Connect to the wallet
   * @param _chainType - Chain type (only EVM supported)
   * @returns Array of connected accounts
   */
  async connect(_chainType: ChainType = "evm"): Promise<UnifiedAccount[]> {
    if (!this.isInstalled()) {
      throw new Error(`${this.name} wallet is not installed`);
    }

    try {
      const evmProvider = this.getEVMProvider();
      if (!evmProvider || !isEIP1193Provider(evmProvider)) {
        throw new Error(`${this.name} EVM provider not available`);
      }

      this.evmAdapter = new EVMAdapter(evmProvider);
      const accounts = await this.evmAdapter.connect(DEFAULT_EVM_CHAIN_ID);

      if (accounts.length === 0) {
        throw new Error("No accounts connected");
      }

      Logger.info(`${this.name} connected`, { accountCount: accounts.length });
      return accounts;
    } catch (error) {
      Logger.error(`${this.name} connection failed`, { error });
      throw error;
    }
  }

  /**
   * Disconnect from the wallet
   */
  async disconnect(): Promise<void> {
    try {
      if (this.evmAdapter) {
        await this.evmAdapter.disconnect();
        this.evmAdapter = null;
      }
      Logger.info(`${this.name} disconnected`);
    } catch (error) {
      Logger.error(`${this.name} disconnect failed`, { error });
      throw error;
    }
  }

  /**
   * Get accounts from the wallet
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
  async switchChain(chainId: number | string, _chainType: ChainType): Promise<void> {
    if (this.evmAdapter) {
      await this.evmAdapter.switchChain(chainId as number);
    } else {
      throw new Error(`${this.name} not connected`);
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
    throw new Error(`${this.name} only supports EVM transactions`);
  }

  /**
   * Sign a message
   * @param message - Message to sign
   * @param _chainType - Chain type (only EVM supported)
   * @returns Signature
   */
  async signMessage(message: string | Uint8Array, _chainType: ChainType): Promise<string> {
    if (this.evmAdapter) {
      return this.evmAdapter.signMessage(message);
    }
    throw new Error(`${this.name} not connected`);
  }
}
