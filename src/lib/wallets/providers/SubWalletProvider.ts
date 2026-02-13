/**
 * SubWallet Provider
 * Multi-chain wallet supporting EVM and Polkadot chains
 * SubWallet is the most popular wallet in the Polkadot ecosystem
 */

import { Logger } from "@/utils/logger";
import type {
  ChainType,
  UnifiedAccount,
  WalletCategory,
} from "@/types/wallet";
import { EVMAdapter, isEIP1193Provider } from "../adapters/EVMAdapter";
import { PolkadotAdapter } from "../adapters/PolkadotAdapter";
import { DEFAULT_EVM_CHAIN_ID } from "@/config/chains";
import { BaseMultiChainProvider, type SecondaryChainAdapter } from "./BaseMultiChainProvider";

/**
 * SubWalletProvider - Multi-chain wallet for EVM and Polkadot
 * SubWallet provides seamless switching between Substrate and EVM accounts
 */
export class SubWalletProvider extends BaseMultiChainProvider {
  readonly name = "SubWallet";
  readonly icon = "subwallet";
  readonly category: WalletCategory = "multichain";
  readonly supportedChainTypes: ChainType[] = ["evm", "polkadot"];

  private polkadotAdapter: PolkadotAdapter | null = null;

  protected get secondaryChainType(): ChainType {
    return "polkadot";
  }

  /**
   * Get underlying provider objects
   */
  get providers() {
    return {
      evm: this.getEVMProvider(),
      polkadot: this.getPolkadotExtensionName(),
    };
  }

  protected getSecondaryAdapter(): SecondaryChainAdapter | null {
    return this.polkadotAdapter;
  }

  protected clearSecondaryAdapter(): void {
    this.polkadotAdapter = null;
  }

  /**
   * Override: Polkadot doesn't have chain switching in the same way
   * @param chainId - Target chain ID
   */
  protected override async switchSecondaryChain(chainId: number | string): Promise<void> {
    Logger.info("Polkadot chain switch requested", { chainId });
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
      (window as { injectedWeb3?: { "subwallet-js"?: unknown } }).injectedWeb3?.["subwallet-js"]
    );

    // Check for SubWallet's Polkadot provider
    const hasPolkadot = Boolean(
      (window as { injectedWeb3?: { "subwallet-js"?: unknown } }).injectedWeb3?.["subwallet-js"]
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

    const injectedWeb3 = (window as { injectedWeb3?: Record<string, unknown> }).injectedWeb3;
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
