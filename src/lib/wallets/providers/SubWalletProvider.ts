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
import { PolkadotAdapter } from "../adapters/PolkadotAdapter";
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

  protected readonly secondaryChainType: ChainType = "polkadot";

  /**
   * Get underlying provider objects
   */
  get providers() {
    return {
      evm: this.getEVMProvider(),
      polkadot: SubWalletProvider.getPolkadotExtensionName(),
    };
  }

  /** @returns The Polkadot adapter instance, or null if not connected */
  protected getSecondaryAdapter(): SecondaryChainAdapter | null {
    return this.polkadotAdapter;
  }

  /** Clears the Polkadot adapter reference during disconnect */
  protected clearSecondaryAdapter(): void {
    this.polkadotAdapter = null;
  }

  /**
   * Override: Polkadot doesn't have chain switching in the same way
   * @param chainId - Target chain ID
   */
  protected override switchSecondaryChain(chainId: number | string): Promise<void> {
    Logger.info(`${this.name}: Polkadot chain switch requested`, { chainId });
    return Promise.resolve();
  }

  /**
   * Check if SubWallet is installed
   * @returns True if SubWallet extension is available
   */
  isInstalled(): boolean {
    if (this.supportedChainTypes.length === 0) return false;
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
   * Get SubWallet EVM provider from window
   */
  protected getEVMProvider(): unknown {
    if (!this.isInstalled()) return null;

    // SubWallet injects as window.SubWallet for EVM
    const subwallet = (window as { SubWallet?: unknown }).SubWallet;
    if (subwallet) return subwallet;

    return null;
  }

  /**
   * Connect to SubWallet Polkadot provider
   * @returns Array of Polkadot accounts
   */
  protected async connectSecondary(): Promise<UnifiedAccount[]> {
    const extensionName = SubWalletProvider.getPolkadotExtensionName();
    if (!extensionName) {
      throw new Error("SubWallet Polkadot extension not available");
    }

    this.polkadotAdapter = new PolkadotAdapter(extensionName);
    return await this.polkadotAdapter.connect();
  }

  /**
   * Get SubWallet Polkadot extension name
   */
  private static getPolkadotExtensionName(): string | null {
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
