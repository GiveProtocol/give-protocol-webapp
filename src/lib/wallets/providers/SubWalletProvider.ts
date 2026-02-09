/**
 * SubWallet Provider
 * Multi-chain wallet supporting EVM and Polkadot chains
 * SubWallet is the most popular wallet in the Polkadot ecosystem
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
import { PolkadotAdapter } from "../adapters/PolkadotAdapter";
import { DEFAULT_EVM_CHAIN_ID } from "@/config/chains";

/**
 * SubWalletProvider - Multi-chain wallet for EVM and Polkadot
 * SubWallet provides seamless switching between Substrate and EVM accounts
 */
export class SubWalletProvider implements UnifiedWalletProvider {
  readonly name = "SubWallet";
  readonly icon = "subwallet";
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
      polkadot: this.getPolkadotExtensionName(),
    };
  }

  /**
   * Check if SubWallet is installed
   * @returns True if SubWallet extension is available
   */
  isInstalled(): boolean {
    if (typeof window === "undefined") return false;

    // Check for SubWallet's EVM provider
    const hasEVM = Boolean(
      (window as { SubWallet?: unknown }).SubWallet ||
      (window as { injectedWeb3?: { "subwallet-js"?: unknown } })
        .injectedWeb3?.["subwallet-js"],
    );

    // Check for SubWallet's Polkadot provider
    const hasPolkadot = Boolean(
      (window as { injectedWeb3?: { "subwallet-js"?: unknown } })
        .injectedWeb3?.["subwallet-js"],
    );

    return hasEVM || hasPolkadot;
  }

  /**
   * Connect to SubWallet
   * @param chainType - Chain type to connect (defaults to EVM)
   * @returns Array of connected accounts
   */
  async connect(chainType: ChainType = "evm"): Promise<UnifiedAccount[]> {
    if (!this.isInstalled()) {
      throw new Error("SubWallet is not installed");
    }

    const accounts: UnifiedAccount[] = [];

    try {
      if (chainType === "evm") {
        const evmAccounts = await this.connectEVM();
        accounts.push(...evmAccounts);
        this.connectedChainType = "evm";
      }

      if (chainType === "polkadot") {
        const polkadotAccounts = await this.connectPolkadot();
        accounts.push(...polkadotAccounts);
        this.connectedChainType = "polkadot";
      }

      if (accounts.length === 0) {
        throw new Error("No accounts connected");
      }

      Logger.info("SubWallet connected", {
        chainType,
        accountCount: accounts.length,
      });

      return accounts;
    } catch (error) {
      Logger.error("SubWallet connection failed", { error, chainType });
      throw error;
    }
  }

  /**
   * Connect to SubWallet EVM provider
   * @returns Array of EVM accounts
   */
  private async connectEVM(): Promise<UnifiedAccount[]> {
    const evmProvider = this.getEVMProvider();
    if (!evmProvider || !isEIP1193Provider(evmProvider)) {
      throw new Error("SubWallet EVM provider not available");
    }

    this.evmAdapter = new EVMAdapter(evmProvider);
    return this.evmAdapter.connect(DEFAULT_EVM_CHAIN_ID);
  }

  /**
   * Connect to SubWallet Polkadot provider
   * @returns Array of Polkadot accounts
   */
  private async connectPolkadot(): Promise<UnifiedAccount[]> {
    const extensionName = this.getPolkadotExtensionName();
    if (!extensionName) {
      throw new Error("SubWallet Polkadot extension not available");
    }

    this.polkadotAdapter = new PolkadotAdapter(extensionName);
    return this.polkadotAdapter.connect();
  }

  /**
   * Disconnect from SubWallet
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
      Logger.info("SubWallet disconnected");
    } catch (error) {
      Logger.error("SubWallet disconnect failed", { error });
      throw error;
    }
  }

  /**
   * Get accounts from SubWallet
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
      // Polkadot doesn't have chain switching in the same way
      Logger.info("Polkadot chain switch requested", { chainId });
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
   * Get SubWallet EVM provider from window
   */
  private getEVMProvider(): unknown {
    if (typeof window === "undefined") return null;

    // SubWallet injects as window.SubWallet for EVM
    const subwallet = (window as { SubWallet?: unknown }).SubWallet;
    if (subwallet) return subwallet;

    return null;
  }

  /**
   * Get SubWallet Polkadot extension name
   */
  private getPolkadotExtensionName(): string | null {
    if (typeof window === "undefined") return null;

    const injectedWeb3 = (window as { injectedWeb3?: Record<string, unknown> })
      .injectedWeb3;
    if (injectedWeb3?.["subwallet-js"]) {
      return "subwallet-js";
    }

    return null;
  }
}

/**
 * Create a SubWallet provider instance
 * @returns SubWalletProvider if available, null otherwise
 */
export function createSubWalletProvider(): SubWalletProvider | null {
  const provider = new SubWalletProvider();
  return provider.isInstalled() ? provider : null;
}
