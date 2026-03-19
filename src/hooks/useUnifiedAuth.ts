import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { supabase } from '@/lib/supabase';
import { ENV } from '@/config/env';
import { Logger } from '@/utils/logger';
import { ethers } from 'ethers';

interface UserIdentity {
  id: string;
  user_id: string;
  wallet_address: string | null;
  primary_auth_method: 'email' | 'wallet';
  wallet_linked_at: string | null;
}

interface UnifiedUser {
  id: string;
  email: string | null;
  role: 'donor' | 'charity' | 'volunteer' | 'admin';
  walletAddress: string | null;
  authMethod: 'email' | 'wallet';
  displayName: string | null;
}

interface UnifiedAuthState {
  user: UnifiedUser | null;
  isAuthenticated: boolean;
  authMethod: 'email' | 'wallet' | null;
  email: string | null;
  walletAddress: string | null;
  isWalletConnected: boolean;
  isWalletLinked: boolean;
  chainId: number | null;
  role: 'donor' | 'charity' | 'volunteer' | 'admin';
  loading: boolean;
  error: string | null;

  signInWithEmail: (_email: string, _password: string) => Promise<void>;
  signUpWithEmail: (_email: string, _password: string, _metadata?: Record<string, unknown>) => Promise<void>;
  signInWithWallet: () => Promise<void>;
  linkWallet: () => Promise<void>;
  unlinkWallet: () => Promise<void>;
  signOut: () => Promise<void>;
}

/** Generates a random nonce for wallet signature messages. */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Unified authentication hook that merges Supabase auth (Web2) and wallet
 * connection (Web3) into a single identity-aware interface.
 */
export function useUnifiedAuth(): UnifiedAuthState {
  const auth = useAuthContext();
  const web3 = useWeb3();
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user_identities record when the auth user changes
  useEffect(() => {
    if (!auth.user) {
      setIdentity(null);
      return;
    }

    let cancelled = false;

    const fetchIdentity = async () => {
      const { data, error: fetchError } = await supabase
        .from('user_identities')
        .select('*')
        .eq('user_id', auth.user!.id)
        .single();

      if (!cancelled) {
        if (fetchError) {
          // Identity record may not exist yet for existing users
          Logger.info('No user_identities record found', { userId: auth.user!.id });
        } else {
          setIdentity(data as UserIdentity);
        }
      }
    };

    fetchIdentity();
    return () => { cancelled = true; };
  }, [auth.user]);

  const isAuthenticated = Boolean(auth.user);
  const authMethod = identity?.primary_auth_method ?? (auth.user ? 'email' : null);
  const isWalletLinked = Boolean(identity?.wallet_address);
  const resolvedRole = (auth.userType ?? 'donor') as UnifiedAuthState['role'];

  const unifiedUser = useMemo<UnifiedUser | null>(() => {
    if (!auth.user) return null;
    return {
      id: auth.user.id,
      email: auth.user.email ?? null,
      role: resolvedRole,
      walletAddress: identity?.wallet_address ?? null,
      authMethod: authMethod as 'email' | 'wallet',
      displayName: (auth.user.user_metadata?.name as string) ?? null,
    };
  }, [auth.user, resolvedRole, identity?.wallet_address, authMethod]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use AuthContext login without account type enforcement
      // Pass 'donor' as the accountType for backward compatibility
      // but the unified flow doesn't enforce the split
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (
    email: string,
    password: string,
    metadata: Record<string, unknown> = {},
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { type: 'donor', ...metadata },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        if (
          signUpError.message?.toLowerCase().includes('already registered') ||
          signUpError.message?.toLowerCase().includes('already exists')
        ) {
          throw new Error('This email is already registered. Please sign in or use a different email.');
        }
        throw signUpError;
      }

      if (data.user) {
        // Create profile
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          type: 'donor',
          role: 'donor',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!web3.provider) {
        await web3.connect();
      }

      const provider = web3.provider;
      if (!provider) {
        throw new Error('No wallet provider available');
      }

      const signer = await new ethers.BrowserProvider(
        (window as unknown as { ethereum: ethers.Eip1193Provider }).ethereum,
      ).getSigner();
      const address = await signer.getAddress();
      const nonce = generateNonce();
      const message = `Sign in to Give Protocol.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
      const signature = await signer.signMessage(message);

      // Call the wallet-auth edge function
      const { data, error: fnError } = await supabase.functions.invoke('wallet-auth', {
        body: {
          walletAddress: address,
          signature,
          message,
          nonce,
        },
      });

      if (fnError || !data?.success) {
        throw new Error(data?.error ?? fnError?.message ?? 'Wallet authentication failed');
      }

      // Set the session from the edge function response
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        throw sessionError;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wallet sign-in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [web3.provider, web3.connect]);

  const linkWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.user) {
        throw new Error('You must be signed in to link a wallet');
      }

      if (!web3.isConnected) {
        await web3.connect();
      }

      const signer = await new ethers.BrowserProvider(
        (window as unknown as { ethereum: ethers.Eip1193Provider }).ethereum,
      ).getSigner();
      const address = await signer.getAddress();
      const message = `Link wallet to Give Protocol account.\n\nAccount: ${auth.user.email ?? auth.user.id}\nTimestamp: ${new Date().toISOString()}`;
      const signature = await signer.signMessage(message);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${ENV.SUPABASE_URL}/functions/v1/link-wallet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': ENV.SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ walletAddress: address, signature, message }),
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error ?? 'Failed to link wallet');
      }

      // Refresh identity state
      setIdentity((prev) => prev ? {
        ...prev,
        wallet_address: result.walletAddress,
        wallet_linked_at: result.linkedAt,
      } : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to link wallet';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auth.user, web3.isConnected, web3.connect]);

  const unlinkWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.user) {
        throw new Error('You must be signed in to unlink a wallet');
      }

      const { error: updateError } = await supabase
        .from('user_identities')
        .update({
          wallet_address: null,
          wallet_linked_at: null,
        })
        .eq('user_id', auth.user.id);

      if (updateError) {
        throw updateError;
      }

      setIdentity((prev) => prev ? {
        ...prev,
        wallet_address: null,
        wallet_linked_at: null,
      } : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unlink wallet';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (web3.isConnected) {
        await web3.disconnect();
      }
      await supabase.auth.signOut();

      setIdentity(null);
      window.location.href = `${window.location.origin}/auth`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [web3.isConnected, web3.disconnect]);

  return {
    user: unifiedUser,
    isAuthenticated,
    authMethod: authMethod as 'email' | 'wallet' | null,
    email: auth.user?.email ?? null,
    walletAddress: identity?.wallet_address ?? web3.address,
    isWalletConnected: web3.isConnected,
    isWalletLinked,
    chainId: web3.chainId,
    role: resolvedRole,
    loading: loading || auth.loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithWallet,
    linkWallet,
    unlinkWallet,
    signOut,
  };
}
