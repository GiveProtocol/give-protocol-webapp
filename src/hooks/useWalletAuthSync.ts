import { useEffect, useRef } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAuth } from '@/contexts/AuthContext';
import { Logger } from '@/utils/logger';

/**
 * Syncs wallet disconnection with auth logout.
 * When the wallet transitions from connected to disconnected,
 * automatically signs the user out of their Supabase session.
 *
 * @returns {void}
 */
export function useWalletAuthSync(): void {
  const { isConnected } = useWeb3();
  const { user, logout } = useAuth();
  const wasConnectedRef = useRef(isConnected);

  useEffect(() => {
    const wasConnected = wasConnectedRef.current;
    wasConnectedRef.current = isConnected;

    if (wasConnected && !isConnected && user) {
      Logger.info('Wallet disconnected — logging out user');
      logout().catch((err: unknown) => {
        Logger.warn('Auto-logout after wallet disconnect failed', { error: err });
        window.location.href = `${window.location.origin}/login`;
      });
    }
  }, [isConnected, user, logout]);
}
