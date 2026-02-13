import React, { useState, useCallback } from "react";
import { Wallet, ShieldCheck, ArrowRight, X, AlertCircle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useWeb3 } from "@/contexts/Web3Context";
import { useWallet, type WalletProvider } from "@/hooks/useWallet";
import { Logger } from "@/utils/logger";

interface WalletConnectionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close (dismiss) */
  onClose: () => void;
  /** Callback when wallet is successfully connected */
  onConnected?: () => void;
}

/**
 * Modal prompting users to connect their wallet after login
 * Displays available wallets and handles the connection flow
 *
 * @param props - WalletConnectionModalProps
 * @returns Modal JSX element
 */
export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const { connect, isConnecting } = useWeb3();
  const { getInstalledWallets } = useWallet();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const installedWallets = getInstalledWallets();

  const handleWalletConnect = useCallback(
    async (wallet: WalletProvider) => {
      try {
        setConnectionError(null);
        setSelectedWallet(wallet.name);

        await connect(wallet.provider);

        Logger.info("Wallet connected via modal", { wallet: wallet.name });

        if (onConnected) {
          onConnected();
        }
        onClose();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to connect wallet";

        // Don't show error for user rejection
        if (message.toLowerCase().includes("user rejected")) {
          setSelectedWallet(null);
          return;
        }

        setConnectionError(message);
        Logger.error("Wallet connection failed", {
          wallet: wallet.name,
          error: err,
        });
      } finally {
        setSelectedWallet(null);
      }
    },
    [connect, onClose, onConnected]
  );

  const handleSkip = useCallback(() => {
    Logger.info("User dismissed wallet connection modal");
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      size="md"
      closeOnBackdrop={false}
      showCloseButton={false}
    >
      {/* Header with icon */}
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mb-4">
          <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connect a wallet to unlock all features of Give Protocol
        </p>
      </div>

      {/* Benefits list */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Track your donations transparently on the blockchain
            </span>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Receive GIVE tokens as rewards for your contributions
            </span>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Participate in governance decisions for the protocol
            </span>
          </li>
        </ul>
      </div>

      {/* Error message */}
      {connectionError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {connectionError}
          </p>
        </div>
      )}

      {/* Wallet options */}
      <div className="space-y-2 mb-6">
        {installedWallets.length > 0 ? (
          installedWallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => handleWalletConnect(wallet)}
              disabled={isConnecting}
              className={`
                w-full flex items-center justify-between p-4
                bg-white dark:bg-gray-800
                border-2 rounded-xl
                transition-all duration-200
                ${
                  selectedWallet === wallet.name
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700"
                }
                ${isConnecting ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"}
              `}
            >
              <div className="flex items-center gap-3">
                <img
                  src={`/icons/${wallet.icon}.svg`}
                  alt=""
                  className="w-10 h-10"
                  aria-hidden="true"
                />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {wallet.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedWallet === wallet.name && isConnecting
                      ? "Connecting..."
                      : "Click to connect"}
                  </p>
                </div>
              </div>
              <ArrowRight
                className={`h-5 w-5 transition-transform ${
                  selectedWallet === wallet.name && isConnecting
                    ? "animate-pulse"
                    : ""
                } text-gray-400 dark:text-gray-500`}
              />
            </button>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No wallet extension detected
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
            >
              Install MetaMask to get started
            </a>
          </div>
        )}
      </div>

      {/* Skip button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          disabled={isConnecting}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4 mr-1" />
          Skip for now
        </Button>
      </div>

      {/* Footer note */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
        You can connect your wallet anytime from the navigation bar
      </p>
    </Modal>
  );
};

export default WalletConnectionModal;
