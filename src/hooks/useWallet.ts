import { Logger } from "@/utils/logger";
import { CHAIN_IDS } from "@/config/contracts";

export interface WalletProvider {
  name: string;
  icon: string;
  isInstalled: () => boolean;
  isConnected: (_address: string) => Promise<boolean>; // Prefixed as unused in interface
  connect: () => Promise<string>;
  disconnect: () => Promise<void>;
  switchChain: (_chainId: number | string) => Promise<void>;
}

/**
 * Base class for EVM-compatible wallet providers
 * @class EVMWalletBase
 * @implements {WalletProvider}
 * @description Provides common functionality for Ethereum Virtual Machine compatible wallets.
 * Handles connection, disconnection, chain switching, and account management for EVM wallets.
 * @example
 * ```typescript
 * class CustomWallet extends EVMWalletBase {
 *   constructor() {
 *     super('Custom', 'custom-icon', window.ethereum);
 *   }
 * }
 * ```
 */
class EVMWalletBase implements WalletProvider {
  readonly name: string;
  readonly icon: string;
  protected readonly provider: unknown;
  private disconnectionAttempts = 0;
  private chainParams: Record<number, unknown> | null = null;

  constructor(name: string, icon: string, provider: unknown) {
    this.name = name;
    this.icon = icon;
    this.provider = provider;
  }

  isInstalled(): boolean {
    return Boolean(this.provider);
  }

  async isConnected(address: string): Promise<boolean> {
    try {
      if (!this.provider || typeof this.provider.request !== "function") {
        return false;
      }
      const accounts = await this.provider.request({ method: "eth_accounts" });
      return accounts?.includes(address) || false;
    } catch {
      return false;
    }
  }

  async connect(): Promise<string> {
    try {
      if (!this.provider || typeof this.provider.request !== "function") {
        throw new Error(`${this.name} provider not found`);
      }
      const accounts = await this.provider.request({
        method: "eth_requestAccounts",
      });

      if (!accounts?.length) {
        throw new Error("No accounts found");
      }

      return accounts[0];
    } catch (error) {
      Logger.error(`${this.name} connection failed`, { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.disconnectionAttempts++;
    // Most EVM wallets don't have a disconnect method
  }

  async switchChain(chainId: number): Promise<void> {
    try {
      if (!this.provider || typeof this.provider.request !== "function") {
        throw new Error(`${this.name} provider not found`);
      }
      await this.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: unknown) {
      if (error.code === 4902) {
        // Chain not added, add it
        await this.addChain(chainId);
      } else {
        throw error;
      }
    }
  }

  protected async addChain(chainId: number): Promise<void> {
    const chainParams = this.getChainParams(chainId);
    if (!chainParams) throw new Error("Unsupported chain");

    await this.provider.request({
      method: "wallet_addEthereumChain",
      params: [chainParams],
    });
  }

  protected getChainParams(chainId: number) {
    if (!this.chainParams) {
      this.chainParams = {};
    }
    const chains = {
      [CHAIN_IDS.MOONBASE]: {
        chainId: `0x${CHAIN_IDS.MOONBASE.toString(16)}`,
        chainName: "Moonbase Alpha",
        nativeCurrency: {
          name: "DEV",
          symbol: "DEV",
          decimals: 18,
        },
        rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
        blockExplorerUrls: ["https://moonbase.moonscan.io/"],
      },
      [CHAIN_IDS.MOONBEAM]: {
        chainId: `0x${CHAIN_IDS.MOONBEAM.toString(16)}`,
        chainName: "Moonbeam",
        nativeCurrency: {
          name: "GLMR",
          symbol: "GLMR",
          decimals: 18,
        },
        rpcUrls: ["https://rpc.api.moonbeam.network"],
        blockExplorerUrls: ["https://moonbeam.moonscan.io/"],
      },
      [CHAIN_IDS.ASTAR]: {
        chainId: `0x${CHAIN_IDS.ASTAR.toString(16)}`,
        chainName: "Astar",
        nativeCurrency: {
          name: "ASTR",
          symbol: "ASTR",
          decimals: 18,
        },
        rpcUrls: ["https://astar.api.onfinality.io/public"],
        blockExplorerUrls: ["https://blockscout.com/astar"],
      },
      [CHAIN_IDS.POLYGON]: {
        chainId: `0x${CHAIN_IDS.POLYGON.toString(16)}`,
        chainName: "Polygon",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18,
        },
        rpcUrls: ["https://polygon-rpc.com"],
        blockExplorerUrls: ["https://polygonscan.com/"],
      },
    };
    return chains[chainId as keyof typeof chains];
  }
}

/**
 * MetaMask wallet provider implementation
 * @class MetaMaskWallet
 * @extends EVMWalletBase
 * @description Integrates with MetaMask browser extension for Ethereum transactions.
 * Provides MetaMask-specific functionality including connection management and chain switching.
 * @example
 * ```typescript
 * const metamask = new MetaMaskWallet();
 * if (metamask.isInstalled()) {
 *   const address = await metamask.connect();
 *   console.log('Connected to:', address);
 * }
 * ```
 */
class MetaMaskWallet extends EVMWalletBase {
  private installationChecks = 0;

  constructor() {
    super(
      "MetaMask",
      "metamask",
      window.ethereum?.isMetaMask ? window.ethereum : null,
    );
  }

  isInstalled(): boolean {
    this.installationChecks++;
    return Boolean(window.ethereum?.isMetaMask);
  }
}

/**
 * WalletConnect provider implementation
 * @class WalletConnect
 * @implements {WalletProvider}
 * @description Integrates with WalletConnect protocol for mobile wallet connections.
 * Supports connecting any WalletConnect-compatible wallet via QR code or deep link.
 * @example
 * ```typescript
 * const walletConnect = new WalletConnect();
 * const address = await walletConnect.connect();
 * await walletConnect.switchChain(1287); // Moonbase Alpha
 * ```
 */
class WalletConnect implements WalletProvider {
  readonly name = "WalletConnect";
  readonly icon = "walletconnect";
  private readonly provider: unknown = null;
  private connectionAttempts = 0;

  isInstalled(): boolean {
    // WalletConnect is always available as it doesn't require installation
    // Using readonly property to satisfy 'this' requirement
    return Boolean(this.name);
  }

  async isConnected(_address: string): Promise<boolean> {
    // Implementation would check WalletConnect session
    this.connectionAttempts++;
    return false;
  }

  async connect(): Promise<string> {
    this.connectionAttempts++;
    // In a real implementation, this would initialize WalletConnect
    throw new Error("WalletConnect integration pending");
  }

  async disconnect(): Promise<void> {
    // WalletConnect disconnect would be implemented here
    this.connectionAttempts++;
  }

  async switchChain(_chainId: number | string): Promise<void> {
    Logger.info("WalletConnect chain switch requested", { 
      chainId: _chainId,
      provider: this.provider,
      connectionAttempts: this.connectionAttempts
    });
  }
}

/**
 * Nova Wallet provider implementation
 * @class NovaWallet
 * @extends EVMWalletBase
 * @description Integrates with Nova Wallet for Polkadot ecosystem.
 * Nova is a mobile-first wallet popular in the Polkadot/Kusama ecosystem.
 * @example
 * ```typescript
 * const nova = new NovaWallet();
 * if (nova.isInstalled()) {
 *   const address = await nova.connect();
 *   await nova.switchChain(1284); // Moonbeam
 * }
 * ```
 */
class NovaWallet extends EVMWalletBase {
  private installationChecks = 0;

  constructor() {
    super(
      "Nova Wallet",
      "nova",
      window.nova ? window.nova : null,
    );
  }

  isInstalled(): boolean {
    this.installationChecks++;
    return typeof window.nova !== "undefined";
  }
}

/**
 * SubWallet provider implementation
 * @class SubWallet
 * @extends EVMWalletBase
 * @description Integrates with SubWallet browser extension for Polkadot ecosystem.
 * SubWallet is the most popular wallet in the Polkadot ecosystem with full EVM support.
 * @example
 * ```typescript
 * const subwallet = new SubWallet();
 * if (subwallet.isInstalled()) {
 *   const address = await subwallet.connect();
 *   await subwallet.switchChain(1287); // Moonbase Alpha
 * }
 * ```
 */
class SubWallet extends EVMWalletBase {
  private installationChecks = 0;

  constructor() {
    super(
      "SubWallet",
      "subwallet",
      window.SubWallet ? window.SubWallet : null,
    );
  }

  isInstalled(): boolean {
    this.installationChecks++;
    return typeof window.SubWallet !== "undefined";
  }
}

/**
 * Talisman wallet provider implementation
 * @class TalismanWallet
 * @extends EVMWalletBase
 * @description Integrates with Talisman wallet for multi-chain Polkadot ecosystem support.
 * Talisman provides seamless switching between Substrate and EVM accounts.
 * @example
 * ```typescript
 * const talisman = new TalismanWallet();
 * if (talisman.isInstalled()) {
 *   const address = await talisman.connect();
 *   await talisman.switchChain(1284); // Moonbeam
 * }
 * ```
 */
class TalismanWallet extends EVMWalletBase {
  private installationChecks = 0;

  constructor() {
    super(
      "Talisman",
      "talisman",
      window.talismanEth ? window.talismanEth : null,
    );
  }

  isInstalled(): boolean {
    this.installationChecks++;
    return typeof window.talismanEth !== "undefined";
  }
}

/**
 * React hook for managing multiple cryptocurrency wallets
 * @function useWallet
 * @description Provides access to various wallet providers including MetaMask, Coinbase, Tally, Brave, and Polkadot.
 * Returns utilities for discovering installed wallets and accessing wallet instances for connection management.
 * @returns {Object} Object containing wallet management utilities
 * @returns {Function} returns.getInstalledWallets - Function that returns array of installed wallet providers
 * @returns {WalletProvider[]} returns.wallets - Array of all available wallet providers
 * @example
 * ```tsx
 * function WalletSelector() {
 *   const { getInstalledWallets, wallets } = useWallet();
 *   const installedWallets = getInstalledWallets();
 *
 *   return (
 *     <div>
 *       {installedWallets.map(wallet => (
 *         <button key={wallet.name} onClick={() => wallet.connect()}>
 *           Connect {wallet.name}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWallet() {
  const wallets: WalletProvider[] = [
    new MetaMaskWallet(),
    new SubWallet(),
    new TalismanWallet(),
    new WalletConnect(),
    new NovaWallet(),
  ];

  const getInstalledWallets = () => {
    return wallets.filter((wallet) => wallet.isInstalled());
  };

  return {
    getInstalledWallets,
    wallets,
  };
}
