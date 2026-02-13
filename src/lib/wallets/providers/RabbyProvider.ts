/**
 * Rabby Wallet Provider
 * EVM-only wallet with advanced security features
 * Rabby is known for transaction simulation and security warnings
 */

import { BaseEVMProvider } from "./BaseEVMProvider";

/**
 * RabbyProvider - EVM-only browser wallet with security features
 * Rabby provides transaction simulation and pre-signing security checks
 */
export class RabbyProvider extends BaseEVMProvider {
  readonly name = "Rabby";
  readonly icon = "rabby";

  /**
   * Check if Rabby is installed
   * @returns True if Rabby extension is available
   */
  isInstalled(): boolean {
    if (typeof window === "undefined") return false;

    // Rabby injects as window.rabby or sets isRabby flag on window.ethereum
    const hasRabby = Boolean(
      (window as { rabby?: unknown }).rabby ||
      (window.ethereum as { isRabby?: boolean })?.isRabby
    );

    return hasRabby;
  }

  /**
   * Get Rabby EVM provider from window
   */
  protected getEVMProvider(): unknown {
    if (typeof window === "undefined") return null;

    // Rabby can inject as window.rabby
    const rabby = (window as { rabby?: unknown }).rabby;
    if (rabby) return rabby;

    // Or it may be on window.ethereum with isRabby flag
    if ((window.ethereum as { isRabby?: boolean })?.isRabby) {
      return window.ethereum;
    }

    return null;
  }
}

/**
 * Create a Rabby provider instance
 * @returns RabbyProvider if available, null otherwise
 */
export function createRabbyProvider(): RabbyProvider | null {
  const provider = new RabbyProvider();
  return provider.isInstalled() ? provider : null;
}
