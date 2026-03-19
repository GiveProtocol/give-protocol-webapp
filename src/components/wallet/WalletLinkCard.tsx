import React, { useState, useCallback } from 'react';
import { Wallet, Link as LinkIcon, Unlink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Logger } from '@/utils/logger';

/** Card displaying wallet link status with actions to link or unlink. */
export const WalletLinkCard: React.FC = () => {
  const { walletAddress, isWalletLinked, isWalletConnected, linkWallet, unlinkWallet, loading } = useUnifiedAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleLink = useCallback(async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await linkWallet();
      setActionSuccess('Wallet linked successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to link wallet';
      setActionError(msg);
      Logger.error('Wallet link failed', { error: msg });
    }
  }, [linkWallet]);

  const handleUnlink = useCallback(async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await unlinkWallet();
      setActionSuccess('Wallet unlinked');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to unlink wallet';
      setActionError(msg);
      Logger.error('Wallet unlink failed', { error: msg });
    }
  }, [unlinkWallet]);

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
          <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Wallet Connection</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isWalletLinked ? 'Your wallet is linked to this account' : 'Link a wallet for on-chain features'}
          </p>
        </div>
      </div>

      {/* Status */}
      {isWalletLinked && truncatedAddress && (
        <div className="flex items-center gap-2 p-3 mb-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            Linked: {truncatedAddress}
          </span>
        </div>
      )}

      {/* Error */}
      {actionError && (
        <div className="flex items-center gap-2 p-3 mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-sm text-red-600 dark:text-red-400">{actionError}</span>
        </div>
      )}

      {/* Success */}
      {actionSuccess && !actionError && (
        <div className="flex items-center gap-2 p-3 mb-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-600 dark:text-emerald-400">{actionSuccess}</span>
        </div>
      )}

      {/* Actions */}
      {isWalletLinked ? (
        <Button
          onClick={handleUnlink}
          variant="secondary"
          size="sm"
          disabled={loading}
          icon={<Unlink className="h-4 w-4" />}
        >
          Unlink Wallet
        </Button>
      ) : (
        <Button
          onClick={handleLink}
          size="sm"
          disabled={loading || !isWalletConnected}
          icon={<LinkIcon className="h-4 w-4" />}
        >
          {isWalletConnected ? 'Link Connected Wallet' : 'Connect Wallet First'}
        </Button>
      )}

      {!isWalletLinked && !isWalletConnected && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Connect your wallet using the button in the navigation bar, then return here to link it.
        </p>
      )}
    </div>
  );
};
