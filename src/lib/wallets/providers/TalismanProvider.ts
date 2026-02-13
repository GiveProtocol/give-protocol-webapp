/**
 * Talisman Wallet Provider
 * Multi-chain wallet supporting EVM and Polkadot/Substrate chains
 */

import { Logger } from "@/utils/logger";
import type {
  ChainType,
  UnifiedAccount,
  WalletCategory,
} from "@/types/wallet";
import { EVMAdapter, isEIP1193Provider } from "../adapters/EVMAdapter";
import {
  PolkadotAdapter,
  enablePolkadotExtension,
} from "../adapters/PolkadotAdapter";
import { DEFAULT_EVM_CHAIN_ID } from "@/config/chains";
import { BaseMultiChainProvider, type SecondaryChainAdapter } from "./BaseMultiChainProvider";

const APP_NAME = "Give Protocol";

/**
 * TalismanProvider - Multi-chain wallet for EVM and Polkadot
 * Talisman is the leading Polkadot ecosystem wallet with full EVM support
 */
export class TalismanProvider extends BaseMultiChainProvider {
  readonly name = "Talisman";
  readonly icon = "talisman";
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
      polkadot: this.polkadotAdapter?.getExtension() ?? null,
    };
  }

  protected getSecondaryAdapter(): SecondaryChainAdapter | null {
    return this.polkadotAdapter;
  }

  protected clearSecondaryAdapter(): void {
    this.polkadotAdapter = null;
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
    return typeof window !== "undefined" && typeof window.talismanEth !== "undefined";
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
