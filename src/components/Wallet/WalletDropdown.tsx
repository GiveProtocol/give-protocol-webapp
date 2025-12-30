import React, { useCallback } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Settings,
  Users,
  LogOut,
  Wallet,
} from "lucide-react";
import type { WalletDropdownProps } from "./types";
import {
  formatAddress,
  getAddressGradient,
  getExplorerUrl,
  formatBalance,
  formatUsdValue,
  PROVIDER_NAMES,
  NETWORK_TOKENS,
} from "./utils";

/**
 * Wallet avatar component with gradient background
 */
interface WalletAvatarInternalProps {
  address: string;
  size?: number;
}

const WalletAvatar: React.FC<WalletAvatarInternalProps> = ({
  address,
  size = 40,
}) => {
  const gradient = getAddressGradient(address);

  return (
    <div
      className="rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: gradient,
      }}
      aria-hidden="true"
    />
  );
};

/**
 * Section divider component
 */
const Divider: React.FC = () => (
  <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" role="separator" />
);

/**
 * Dropdown menu item button
 */
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onClick,
  variant = "default",
  disabled = false,
}) => {
  const baseClasses =
    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";
  const variantClasses =
    variant === "danger"
      ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

/**
 * WalletDropdown component - Displays wallet info and actions in a dropdown menu
 * @param props - WalletDropdownProps
 * @returns Dropdown menu JSX element
 */
export const WalletDropdown: React.FC<WalletDropdownProps> = ({
  address,
  provider,
  network,
  balances,
  copied,
  onCopy,
  onDisconnect,
  onSwitchAccount,
  onSettings,
  hasMultipleAccounts = false,
}) => {
  const tokenSymbol = NETWORK_TOKENS[network] || "DEV";
  const providerName = PROVIDER_NAMES[provider] || provider;

  const handleViewOnExplorer = useCallback(() => {
    const url = getExplorerUrl(network, address);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [network, address]);

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
      role="menu"
      aria-orientation="vertical"
      aria-label="Wallet menu"
    >
      {/* Account Info Section */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center gap-3">
          <WalletAvatar address={address} size={48} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {providerName}
            </p>
            <p
              className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate"
              title={address}
            >
              {formatAddress(address, "medium")}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 flex gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          aria-label={copied ? "Address copied" : "Copy address"}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400">
                Copied!
              </span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleViewOnExplorer}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          aria-label="View on block explorer"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Explorer</span>
        </button>
      </div>

      <Divider />

      {/* Balance Display */}
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
          Balances
        </p>
        {balances.isLoading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-green-500 rounded-full animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {tokenSymbol}
                </span>
              </div>
              <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                {formatBalance(balances.native)}
              </span>
            </div>
            {network === "moonbeam" && balances.glmr !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    GLMR
                  </span>
                </div>
                <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {formatBalance(balances.glmr)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Value
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatUsdValue(balances.usdValue)}
              </span>
            </div>
          </div>
        )}
      </div>

      <Divider />

      {/* Wallet Management Section */}
      <div className="p-2">
        <MenuItem
          icon={<Settings className="h-4 w-4" />}
          label="Account Settings"
          onClick={onSettings}
        />
        {hasMultipleAccounts && (
          <MenuItem
            icon={<Users className="h-4 w-4" />}
            label="Switch Account"
            onClick={onSwitchAccount}
          />
        )}
        <MenuItem
          icon={<LogOut className="h-4 w-4" />}
          label="Disconnect"
          onClick={onDisconnect}
          variant="danger"
        />
      </div>
    </div>
  );
};

export default WalletDropdown;
