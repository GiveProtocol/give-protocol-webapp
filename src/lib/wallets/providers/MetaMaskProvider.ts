/**
 * MetaMask Wallet Provider
 * EVM-only wallet with broad chain support
 */

import { BaseEVMProvider } from "./BaseEVMProvider";

/**
 * MetaMaskProvider - EVM-only browser wallet
 * The most popular browser extension wallet for Ethereum and EVM chains
 */
export class MetaMaskProvider extends BaseEVMProvider {
  readonly name = "MetaMask";
  readonly icon = "metamask";

  /**
   * Check if MetaMask is installed
   * @returns True if MetaMask extension is available
   */
  isInstalled(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(window.ethereum?.isMetaMask);
  }

  /**
   * Get MetaMask EVM provider from window
   */
  protected getEVMProvider(): unknown {
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
