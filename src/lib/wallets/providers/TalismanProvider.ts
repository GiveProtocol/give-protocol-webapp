/**
 * Talisman Wallet Provider
 * Multi-chain wallet supporting EVM and Polkadot/Substrate chains
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
import {
  PolkadotAdapter,
  enablePolkadotExtension,
} from "../adapters/PolkadotAdapter";
import { DEFAULT_EVM_CHAIN_ID } from "@/config/chains";

const APP_NAME = "Give Protocol";

/**
 * TalismanProvider - Multi-chain wallet for EVM and Polkadot
 * Talisman is the leading Polkadot ecosystem wallet with full EVM support
 */
export class TalismanProvider implements UnifiedWalletProvider {
  readonly name = "Talisman";
  readonly icon = "talisman";
  readonly category: WalletCategory = "multichain";
  readonly supportedChainTypes: ChainType[] = ["evm", "polkadot"];

  private evmAdapter: EVMAdapter | null = null;
  private polkadotAdapter: PolkadotAdapter | null = null;
  private connectedChainType: ChainType | null = null;

  /**
   * Get underlying provider objects
   */
  get providers() {
    return {
      evm: this.getEVMProvider(),
      polkadot: this.polkadotAdapter?.getExtension() ?? null,
    };
  }

  /**
   * Check if Talisman is installed
   * @returns True if Talisman extension is available
   */
  isInstalled(): boolean {
    if (typeof window === "undefined") return false;

    // Check for Talisman EVM provider
    const hasTalismanEth = typeof window.talismanEth !== "undefined";

    // Check for Talisman Polkadot extension
    const injectedWeb3 = (window as { injectedWeb3?: Record<string, unknown> })
      .injectedWeb3;
    const hasTalismanSub = Boolean(injectedWeb3?.talisman);

    return hasTalismanEth || hasTalismanSub;
  }

  /**
   * Check if Talisman EVM is available
   * @returns True if Talisman EVM provider exists
   */
  hasEVMSupport(): boolean {
    return (
      typeof window !== "undefined" && typeof window.talismanEth !== "undefined"
    );
  }

  /**
   * Check if Talisman Polkadot is available
   * @returns True if Talisman Polkadot extension exists
   */
  hasPolkadotSupport(): boolean {
    if (typeof window === "undefined") return false;
    const injectedWeb3 = (window as { injectedWeb3?: Record<string, unknown> })
      .injectedWeb3;
    return Boolean(injectedWeb3?.talisman);
  }

  /**
   * Connect to Talisman wallet
   * @param chainType - Chain type to connect (defaults to EVM)
   * @returns Array of connected accounts
   */
  async connect(chainType: ChainType = "evm"): Promise<UnifiedAccount[]> {
    if (!this.isInstalled()) {
      throw new Error("Talisman wallet is not installed");
    }

    const accounts: UnifiedAccount[] = [];

    try {
      if (chainType === "evm") {
        if (!this.hasEVMSupport()) {
          throw new Error("Talisman EVM provider not available");
        }
        const evmAccounts = await this.connectEVM();
        accounts.push(...evmAccounts);
        this.connectedChainType = "evm";
      }

      if (chainType === "polkadot") {
        if (!this.hasPolkadotSupport()) {
          throw new Error("Talisman Polkadot extension not available");
        }
        const polkadotAccounts = await this.connectPolkadot();
        accounts.push(...polkadotAccounts);
        this.connectedChainType = "polkadot";
      }

      if (accounts.length === 0) {
        throw new Error("No accounts connected");
      }

      Logger.info("Talisman connected", {
        chainType,
        accountCount: accounts.length,
      });

      return accounts;
    } catch (error) {
      Logger.error("Talisman connection failed", { error, chainType });
      throw error;
    }
  }

  /**
   * Connect to Talisman EVM provider
   * @returns Array of EVM accounts
   */
  private async connectEVM(): Promise<UnifiedAccount[]> {
    const evmProvider = this.getEVMProvider();
    if (!evmProvider || !isEIP1193Provider(evmProvider)) {
      throw new Error("Talisman EVM provider not available");
    }

    this.evmAdapter = new EVMAdapter(evmProvider);
    return this.evmAdapter.connect(DEFAULT_EVM_CHAIN_ID);
  }

  /**
   * Connect to Talisman Polkadot extension
   * @returns Array of Polkadot accounts
   */
  private async connectPolkadot(): Promise<UnifiedAccount[]> {
    this.polkadotAdapter = await enablePolkadotExtension("talisman", APP_NAME);

    if (!this.polkadotAdapter) {
      throw new Error("Failed to enable Talisman Polkadot extension");
    }

    return this.polkadotAdapter.connect();
  }

  /**
   * Disconnect from Talisman
   */
  async disconnect(): Promise<void> {
    try {
      if (this.evmAdapter) {
        await this.evmAdapter.disconnect();
        this.evmAdapter = null;
      }

      if (this.polkadotAdapter) {
        await this.polkadotAdapter.disconnect();
        this.polkadotAdapter = null;
      }

      this.connectedChainType = null;
      Logger.info("Talisman disconnected");
    } catch (error) {
      Logger.error("Talisman disconnect failed", { error });
      throw error;
    }
  }

  /**
   * Get accounts from Talisman
   * @param chainType - Optional chain type filter
   * @returns Array of accounts
   */
  async getAccounts(chainType?: ChainType): Promise<UnifiedAccount[]> {
    const accounts: UnifiedAccount[] = [];

    if ((!chainType || chainType === "evm") && this.evmAdapter) {
      const evmAccounts = await this.evmAdapter.getAccounts();
      accounts.push(...evmAccounts);
    }

    if ((!chainType || chainType === "polkadot") && this.polkadotAdapter) {
      const polkadotAccounts = await this.polkadotAdapter.getAccounts();
      accounts.push(...polkadotAccounts);
    }

    return accounts;
  }

  /**
   * Switch to a different chain
   * @param chainId - Target chain ID
   * @param chainType - Chain type
   */
  async switchChain(
    chainId: number | string,
    chainType: ChainType,
  ): Promise<void> {
    if (chainType === "evm" && this.evmAdapter) {
      await this.evmAdapter.switchChain(chainId as number);
    } else if (chainType === "polkadot" && this.polkadotAdapter) {
      await this.polkadotAdapter.switchChain(chainId as string);
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

    if (tx.chainType === "polkadot" && this.polkadotAdapter) {
      return this.polkadotAdapter.signTransaction(tx);
    }

    throw new Error(`Cannot sign transaction for ${tx.chainType}`);
  }

  /**
   * Sign a message
   * @param message - Message to sign
   * @param chainType - Chain type for signing
   * @returns Signature
   */
  async signMessage(
    message: string | Uint8Array,
    chainType: ChainType,
  ): Promise<string> {
    if (chainType === "evm" && this.evmAdapter) {
      return this.evmAdapter.signMessage(message);
    }

    if (chainType === "polkadot" && this.polkadotAdapter) {
      return this.polkadotAdapter.signMessage(message);
    }

    throw new Error(`Cannot sign message for ${chainType}`);
  }

  /**
   * Get Talisman EVM provider from window
   */
  private getEVMProvider(): unknown {
    if (typeof window === "undefined") return null;
    return window.talismanEth ?? null;
  }
}

/**
 * Create a Talisman provider instance
 * @returns TalismanProvider if available, null otherwise
 */
export function createTalismanProvider(): TalismanProvider | null {
  const provider = new TalismanProvider();
  return provider.isInstalled() ? provider : null;
}
