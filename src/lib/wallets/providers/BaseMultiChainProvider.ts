/**
 * Base class for multi-chain wallet providers
 * Extracts shared logic from Phantom, Coinbase, Talisman, and SubWallet providers
 */

import { Logger } from "@/utils/logger";
import type {
  ChainType,
  UnifiedAccount,
  UnifiedWalletProvider,
  UnifiedTransactionRequest,
  WalletCategory,
} from "@/types/wallet";
import type { EVMAdapter } from "../adapters/EVMAdapter";

/**
 * Common interface for secondary chain adapters (Solana or Polkadot)
 * Both SolanaAdapter and PolkadotAdapter satisfy this interface
 */
export interface SecondaryChainAdapter {
  disconnect(): Promise<void>;
  getAccounts(): Promise<UnifiedAccount[]>;
  signTransaction(_tx: UnifiedTransactionRequest): Promise<string>;
  signMessage(_message: string | Uint8Array): Promise<string>;
  switchCluster?(_clusterId: string): Promise<void>;
  switchChain?(_chainId: string): Promise<void>;
}

/**
 * BaseMultiChainProvider - Abstract base for wallets supporting EVM + one secondary chain
 * Implements the 5 methods that are identical across all multi-chain providers:
 * disconnect, getAccounts, switchChain, signTransaction, signMessage
 */
export abstract class BaseMultiChainProvider implements UnifiedWalletProvider {
  abstract readonly name: string;
  abstract readonly icon: string;
  abstract readonly category: WalletCategory;
  abstract readonly supportedChainTypes: ChainType[];
  abstract get providers(): Record<string, unknown>;

  protected evmAdapter: EVMAdapter | null = null;
  protected connectedChainType: ChainType | null = null;

  /** The non-EVM chain type this provider supports ("solana" or "polkadot") */
  protected abstract get secondaryChainType(): ChainType;

  abstract isInstalled(): boolean;
  abstract connect(_chainType?: ChainType): Promise<UnifiedAccount[]>;

  /** @returns The secondary adapter instance, or null if not connected */
  protected abstract getSecondaryAdapter(): SecondaryChainAdapter | null;

  /** Clears the secondary adapter reference (called during disconnect) */
  protected abstract clearSecondaryAdapter(): void;

  /**
   * Disconnect from the wallet
   */
  async disconnect(): Promise<void> {
    try {
      if (this.evmAdapter) {
        await this.evmAdapter.disconnect();
        this.evmAdapter = null;
      }

      const secondary = this.getSecondaryAdapter();
      if (secondary) {
        await secondary.disconnect();
        this.clearSecondaryAdapter();
      }

      this.connectedChainType = null;
      Logger.info(`${this.name} disconnected`);
    } catch (error) {
      Logger.error(`${this.name} disconnect failed`, { error });
      throw error;
    }
  }

  /**
   * Get accounts from the wallet
   * @param chainType - Optional chain type filter
   * @returns Array of accounts
   */
  async getAccounts(chainType?: ChainType): Promise<UnifiedAccount[]> {
    const accounts: UnifiedAccount[] = [];

    if ((!chainType || chainType === "evm") && this.evmAdapter) {
      const evmAccounts = await this.evmAdapter.getAccounts();
      accounts.push(...evmAccounts);
    }

    const secondary = this.getSecondaryAdapter();
    if ((!chainType || chainType === this.secondaryChainType) && secondary) {
      const secondaryAccounts = await secondary.getAccounts();
      accounts.push(...secondaryAccounts);
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
    } else if (chainType === this.secondaryChainType) {
      await this.switchSecondaryChain(chainId);
    } else {
      throw new Error(`Cannot switch chain for ${chainType}`);
    }
  }

  /**
   * Switch the secondary chain. Override in subclasses that need different behavior.
   * @param chainId - Target chain ID
   */
  protected async switchSecondaryChain(chainId: number | string): Promise<void> {
    const secondary = this.getSecondaryAdapter();
    if (!secondary) {
      throw new Error(`Cannot switch chain for ${this.secondaryChainType}`);
    }
    if (secondary.switchCluster) {
      await secondary.switchCluster(chainId as string);
    } else if (secondary.switchChain) {
      await secondary.switchChain(chainId as string);
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

    const secondary = this.getSecondaryAdapter();
    if (tx.chainType === this.secondaryChainType && secondary) {
      return secondary.signTransaction(tx);
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

    const secondary = this.getSecondaryAdapter();
    if (chainType === this.secondaryChainType && secondary) {
      return secondary.signMessage(message);
    }

    throw new Error(`Cannot sign message for ${chainType}`);
  }
}
