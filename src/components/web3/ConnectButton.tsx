import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  ChevronDown,
  LogOut,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  User,
} from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useWallet, type WalletProvider } from "@/hooks/useWallet";
import { Button } from "../ui/Button";
import { shortenAddress } from "@/utils/web3";
import { Logger } from "@/utils/logger";
import { CHAIN_IDS } from "@/config/contracts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletAlias } from "@/hooks/useWalletAlias";

interface AccountMenuHeaderProps {
  address: string;
  getInstalledWallets: () => WalletProvider[];
  getExplorerUrl: () => string;
  onCopyAddress: () => void;
}

/**
 * Header section of the account menu showing wallet connection info
 * @param address - The connected wallet address
 * @param getInstalledWallets - Function to get list of installed wallets
 * @param getExplorerUrl - Function to get blockchain explorer URL
 * @param onCopyAddress - Callback to copy wallet address
 */
const AccountMenuHeader: React.FC<AccountMenuHeaderProps> = ({
  address,
  getInstalledWallets,
  getExplorerUrl,
  onCopyAddress,
}) => (
  <div className="p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-500">
        Connected with {getInstalledWallets()[0]?.name || "Wallet"}
      </span>
    </div>
    <div className="flex items-center justify-between">
      <span className="font-medium">{shortenAddress(address)}</span>
      <div className="flex items-center space-x-2">
        <button
          onClick={onCopyAddress}
          className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
        >
          Copy
        </button>
        <a
          href={getExplorerUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  </div>
);

interface AccountMenuActionsProps {
  alias: string | null;
  onManageAlias: () => void;
  onDisconnect: () => void;
}

/**
 * Actions section of the account menu with manage alias and disconnect buttons
 * @param alias - Optional user-defined alias for the wallet
 * @param onManageAlias - Callback to manage wallet alias
 * @param onDisconnect - Callback to disconnect the wallet
 */
const AccountMenuActions: React.FC<AccountMenuActionsProps> = ({
  alias,
  onManageAlias,
  onDisconnect,
}) => (
  <div className="p-2">
    <button
      onClick={onManageAlias}
      className="flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-md"
      role="menuitem"
    >
      <User className="h-4 w-4 mr-2" />
      {alias ? "Change Wallet Alias" : "Set Wallet Alias"}
    </button>
    <button
      onClick={onDisconnect}
      className="flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors rounded-md"
      role="menuitem"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Disconnect
    </button>
  </div>
);

interface AccountMenuProps {
  address: string;
  alias: string | null;
  getInstalledWallets: () => WalletProvider[];
  getExplorerUrl: () => string;
  onDisconnect: () => void;
  onManageAlias: () => void;
}

/**
 * Dropdown menu component displayed when a wallet is connected
 * @param address - The connected wallet address
 * @param alias - Optional user-defined alias for the wallet
 * @param getInstalledWallets - Function to get list of installed wallets
 * @param getExplorerUrl - Function to get blockchain explorer URL for the address
 * @param onDisconnect - Callback to disconnect the wallet
 * @param onManageAlias - Callback to manage wallet alias
 */
const AccountMenu: React.FC<AccountMenuProps> = ({
  address,
  alias,
  getInstalledWallets,
  getExplorerUrl,
  onDisconnect,
  onManageAlias,
}) => {
  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(address);
  }, [address]);

  return (
    <div className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg bg-white ring-1 ring-gray-200 divide-y divide-gray-100 z-50">
      <AccountMenuHeader
        address={address}
        getInstalledWallets={getInstalledWallets}
        getExplorerUrl={getExplorerUrl}
        onCopyAddress={handleCopyAddress}
      />
      <AccountMenuActions
        alias={alias}
        onManageAlias={onManageAlias}
        onDisconnect={onDisconnect}
      />
    </div>
  );
};

interface WalletSelectMenuProps {
  getInstalledWallets: () => WalletProvider[];
  onWalletSelect: (_wallet: WalletProvider) => void;
}

/**
 * Dropdown menu component for selecting a wallet to connect
 * @param getInstalledWallets - Function to get list of installed wallets
 * @param onWalletSelect - Callback when a wallet is selected for connection
 */
const WalletSelectMenu: React.FC<WalletSelectMenuProps> = ({
  getInstalledWallets,
  onWalletSelect,
}) => {
  const handleWalletSelect = useCallback(
    (_wallet: WalletProvider) => () => {
      onWalletSelect(_wallet);
    },
    [onWalletSelect],
  );

  return (
    <div className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg bg-white ring-1 ring-gray-200 z-50">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Connect Wallet</h3>
        <p className="text-sm text-gray-500 mt-1">
          Choose your preferred wallet provider
        </p>
      </div>
      <div className="p-2">
        {getInstalledWallets().map((wallet) => (
          <button
            key={wallet.name}
            onClick={handleWalletSelect(wallet)}
            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-md"
            role="menuitem"
          >
            <img
              src={`/icons/${wallet.icon}.svg`}
              alt=""
              className="w-8 h-8 mr-3"
              aria-hidden="true"
            />
            <div className="flex flex-col items-start">
              <span className="font-medium text-gray-900">{wallet.name}</span>
              <span className="text-xs text-gray-500">
                Connect to your {wallet.name} wallet
              </span>
            </div>
          </button>
        ))}
        {getInstalledWallets().length === 0 && (
          <div className="px-4 py-4 text-sm">
            <p className="font-medium text-gray-900 mb-1">No wallets found</p>
            <p className="text-gray-500">Install MetaMask to continue</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CONNECTION_TIMEOUT = 30000; // 30 seconds
const RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRIES = 3;

// Helper function to check if chain ID is supported
function isSupportedChainId(chainId: number | string): boolean {
  return Object.values(CHAIN_IDS).includes(Number(chainId));
}

/**
 * Primary wallet connection component for the application
 * @function ConnectButton
 * @description Comprehensive Web3 wallet connection button that handles wallet selection, connection states,
 * network switching, error handling, and account management. Supports multiple wallet providers and provides
 * a complete user experience for blockchain interactions.
 * @returns {React.ReactElement} Dynamic button component that shows different states:
 *   - Connect button when no wallet is connected
 *   - Account dropdown with address/alias when connected
 *   - Error state with retry functionality when connection fails
 *   - Loading state during connection attempts
 * @example
 * ```tsx
 * // Basic usage in navigation
 * <ConnectButton />
 *
 * // The button automatically handles all wallet states:
 * // - Shows "Connect" when disconnected
 * // - Shows wallet address or alias when connected
 * // - Provides dropdown menu with account actions
 * // - Handles network switching and error recovery
 * ```
 */
export function ConnectButton() {
  const {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    address,
    error,
    chainId,
    switchChain,
  } = useWeb3();
  const { getInstalledWallets } = useWallet();
  const { logout, user } = useAuth();
  const { alias } = useWalletAlias();
  const navigate = useNavigate();

  const [showWalletSelect, setShowWalletSelect] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showWalletSelect || showAccountMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest(".wallet-dropdown")) {
          setShowWalletSelect(false);
          setShowAccountMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showWalletSelect, showAccountMenu]);

  const handleConnect = useCallback(() => {
    setConnectionError(null);
    setRetryCount(0);
    setIsRetrying(false);
    setShowWalletSelect(true);
  }, []);

  const handleWalletSelect = useCallback(
    async (_wallet: { name: string; provider: unknown }) => {
      try {
        setConnectionError(null);
        setIsRetrying(false);

        const timeoutId = setTimeout(() => {
          setConnectionError("Connection timeout. Please try again.");
          setShowWalletSelect(false);
        }, CONNECTION_TIMEOUT);

        await connect(_wallet.provider);
        clearTimeout(timeoutId);
        setShowWalletSelect(false);

        // Check if connected to supported network
        if (chainId && !isSupportedChainId(chainId)) {
          try {
            await switchChain(CHAIN_IDS.MOONBASE);
          } catch (switchError) {
            throw new Error("Please switch to Moonbase Alpha (TestNet)");
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to connect wallet";
        setConnectionError(`Wallet connection failed: ${message}`);
        Logger.error("Wallet connection failed", {
          wallet: _wallet.name,
          error: err,
          retryCount,
        });

        // Only retry if not user rejected
        if (
          retryCount < MAX_RETRIES &&
          !message.toLowerCase().includes("user rejected")
        ) {
          setIsRetrying(true);
          setRetryCount((prev) => prev + 1);
          setTimeout(
            () => handleWalletSelect(_wallet),
            RETRY_DELAY * Math.pow(2, retryCount),
          );
        }
      }
    },
    [connect, chainId, switchChain, retryCount],
  );

  const handleDisconnect = useCallback(async () => {
    try {
      // Always disconnect wallet first
      await disconnect();

      setShowAccountMenu(false);
      setConnectionError(null);
      setRetryCount(0);
      setIsRetrying(false);

      // Only try to logout if user is actually logged in
      if (user) {
        try {
          await logout();
          // Use window.location to stay on the same domain
          window.location.href = `${window.location.origin}/login`;
        } catch (logoutError) {
          // If logout fails, redirect anyway
          Logger.warn(
            "Logout failed during wallet disconnect, redirecting anyway",
            { error: logoutError },
          );
          window.location.href = `${window.location.origin}/login`;
        }
      } else {
        // If not logged in, just refresh to clear any stale state
        Logger.info("Wallet disconnected while not logged in, refreshing page");
        window.location.reload();
      }
    } catch (err) {
      Logger.error("Wallet disconnection failed", { error: err });
      setShowAccountMenu(false);
      // Even if disconnect fails, reset the UI state and refresh
      setConnectionError(null);
      setRetryCount(0);
      setIsRetrying(false);
      // Force refresh to clear any stale state
      window.location.reload();
    }
  }, [disconnect, logout, user]);

  const handleManageAlias = useCallback(() => {
    setShowAccountMenu(false);
    navigate("/give-dashboard", { state: { showWalletSettings: true } });
  }, [navigate]);

  const handleToggleAccountMenu = useCallback(() => {
    setShowAccountMenu(!showAccountMenu);
  }, [showAccountMenu]);

  const getExplorerUrl = useCallback(() => {
    if (!address) return "#";

    const explorers = {
      [CHAIN_IDS.MOONBASE]: "https://moonbase.moonscan.io/address/",
      [CHAIN_IDS.MOONBEAM]: "https://moonscan.io/address/",
      [CHAIN_IDS.ASTAR]: "https://blockscout.com/astar/address/",
      [CHAIN_IDS.POLYGON]: "https://polygonscan.com/address/",
    };

    return `${explorers[chainId as keyof typeof explorers] || explorers[CHAIN_IDS.MOONBASE]}${address}`;
  }, [address, chainId]);

  if (connectionError || error) {
    return (
      <Button
        onClick={handleConnect}
        variant="secondary"
        size="sm"
        className="text-red-600 shadow-sm hover:shadow-md rounded-md px-4 py-2 transition-all duration-200"
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">
          {connectionError || error.message}
        </span>
        <span className="sm:hidden">Error</span>
        {isRetrying && <RefreshCw className="h-4 w-4 ml-2 animate-spin" />}
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative wallet-dropdown">
        <Button
          onClick={handleToggleAccountMenu}
          variant="secondary"
          size="sm"
          className="flex items-center shadow-sm hover:shadow-md rounded-md px-4 py-2 transition-all duration-200"
          aria-expanded={showAccountMenu}
          aria-haspopup="true"
        >
          <Wallet className="h-4 w-4 mr-2" />
          <span className="mr-1">{alias || shortenAddress(address)}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>

        {showAccountMenu && (
          <AccountMenu
            address={address}
            alias={alias}
            getInstalledWallets={getInstalledWallets}
            getExplorerUrl={getExplorerUrl}
            onDisconnect={handleDisconnect}
            onManageAlias={handleManageAlias}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative wallet-dropdown">
      <Button
        onClick={handleConnect}
        variant="primary"
        size="sm"
        disabled={isConnecting}
        className="flex items-center shadow-sm hover:shadow-md rounded-md px-4 py-2 transition-all duration-200"
        aria-expanded={showWalletSelect}
        aria-haspopup="true"
      >
        <Wallet className="h-4 w-4 mr-2" />
        <span>{isConnecting ? "Connecting..." : "Connect"}</span>
        {isRetrying && <RefreshCw className="h-4 w-4 ml-2 animate-spin" />}
      </Button>

      {showWalletSelect && (
        <WalletSelectMenu
          getInstalledWallets={getInstalledWallets}
          onWalletSelect={handleWalletSelect}
        />
      )}
    </div>
  );
}
