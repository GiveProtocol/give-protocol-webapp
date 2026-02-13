import React, { useCallback, useState } from "react";
import { Wallet, X, ArrowRight } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useWallet, type WalletProvider } from "@/hooks/useWallet";
import { Logger } from "@/utils/logger";

interface WalletReminderBannerProps {
  /** Callback when banner is dismissed */
  onDismiss: () => void;
  /** Callback when wallet is successfully connected */
  onConnected?: () => void;
}

/**
 * Reminder banner displayed when user dismisses the wallet connection modal
 * Provides a compact way to connect wallet without blocking the UI
 *
 * @param props - WalletReminderBannerProps
 * @returns Banner JSX element
 */
export const WalletReminderBanner: React.FC<WalletReminderBannerProps> = ({
  onDismiss,
  onConnected,
}) => {
  const { connect, isConnecting, isConnected } = useWeb3();
  const { getInstalledWallets } = useWallet();
  const [isExpanded, setIsExpanded] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const installedWallets = getInstalledWallets();

  const handleConnectClick = useCallback(() => {
    setIsExpanded(true);
    setConnectionError(null);
  }, []);

  const handleWalletConnect = useCallback(
    async (wallet: WalletProvider) => {
      try {
        setConnectionError(null);
        await connect(wallet.provider);

        Logger.info("Wallet connected via reminder banner", {
          wallet: wallet.name,
        });

        if (onConnected) {
          onConnected();
        }
        setIsExpanded(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to connect wallet";

        // Don't show error for user rejection
        if (message.toLowerCase().includes("user rejected")) {
          return;
        }

        setConnectionError(message);
        Logger.error("Wallet connection failed from banner", {
          wallet: wallet.name,
          error: err,
        });
      }
    },
    [connect, onConnected]
  );

  const handleDismiss = useCallback(() => {
    Logger.info("Wallet reminder banner dismissed");
    onDismiss();
  }, [onDismiss]);

  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
    setConnectionError(null);
  }, []);

  // Don't render if already connected
  if (isConnected) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          {/* Collapsed state */}
          {!isExpanded && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800/40 rounded-lg">
                  <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Connect your wallet to unlock all features
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                    Track donations, earn GIVE tokens, and participate in
                    governance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConnectClick}
                  disabled={isConnecting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                >
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Dismiss reminder"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Expanded state with wallet options */}
          {isExpanded && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Select a wallet to connect
                </p>
                <button
                  onClick={handleCollapse}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Collapse"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Error message */}
              {connectionError && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  {connectionError}
                </p>
              )}

              {/* Wallet buttons */}
              <div className="flex flex-wrap gap-2">
                {installedWallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleWalletConnect(wallet)}
                    disabled={isConnecting}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm transition-all disabled:opacity-60"
                  >
                    <img
                      src={`/icons/${wallet.icon}.svg`}
                      alt=""
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {wallet.name}
                    </span>
                  </button>
                ))}
                {installedWallets.length === 0 && (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
                  >
                    Install MetaMask
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletReminderBanner;
