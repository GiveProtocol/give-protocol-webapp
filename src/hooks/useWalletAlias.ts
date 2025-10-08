import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { WalletAlias } from "@/types/user";
import { Logger } from "@/utils/logger";
import { useToast } from "@/contexts/ToastContext";

/**
 * Wallet alias management hook for user-friendly wallet address naming
 * @function useWalletAlias
 * @description Manages wallet aliases for users, allowing them to assign friendly names to wallet addresses.
 * Includes automatic fetching, alias validation, retry logic with exponential backoff, and comprehensive error handling.
 * Supports CRUD operations for aliases with uniqueness validation and automatic refresh functionality.
 * @returns {Object} Wallet alias management utilities and state
 * @returns {string} returns.alias - Current wallet's alias (empty string if none set)
 * @returns {WalletAlias[]} returns.aliases - Array of all user's wallet aliases
 * @returns {boolean} returns.loading - Loading state for async operations
 * @returns {string | null} returns.error - Error message or null if no error
 * @returns {Function} returns.setWalletAlias - Set/update alias for current wallet: (alias: string) => Promise<boolean>
 * @returns {Function} returns.deleteWalletAlias - Delete alias by ID: (aliasId: string) => Promise<boolean>
 * @returns {Function} returns.getAliasForAddress - Get alias for any address: (address: string) => Promise<string | null>
 * @returns {Function} returns.refreshAliases - Manually refresh user's aliases list: () => Promise<void>
 * @example
 * ```tsx
 * const {
 *   alias,
 *   aliases,
 *   loading,
 *   error,
 *   setWalletAlias,
 *   deleteWalletAlias
 * } = useWalletAlias();
 *
 * // Set an alias for current wallet
 * const success = await setWalletAlias('My Main Wallet');
 *
 * // Get alias for display purposes
 * const displayName = alias || `${address?.slice(0, 6)}...${address?.slice(-4)}`;
 *
 * // Delete an alias
 * await deleteWalletAlias(aliasId);
 * ```
 */
export function useWalletAlias() {
  const { user } = useAuth();
  const { address } = useWeb3();
  const { showToast } = useToast();
  const [alias, setAlias] = useState<string>("");
  const [aliases, setAliases] = useState<WalletAlias[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second base delay

  const fetchWalletAlias = useCallback(async () => {
    if (!user || !address) return;

    try {
      setLoading(true);
      setError(null);

      Logger.info("Fetching wallet alias", { address });

      const { data, error: fetchError } = await supabase
        .from("wallet_aliases")
        .select("alias")
        .eq("user_id", user.id)
        .eq("wallet_address", address)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        throw fetchError;
      }

      setAlias(data?.alias || "");

      // Reset retry count on success
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;

      Logger.error("Error fetching wallet alias", {
        error: errorMessage,
        stack: errorStack,
        address,
        retryCount,
      });

      setError("Failed to fetch wallet alias");

      // Implement retry with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        Logger.info(
          `Retrying wallet alias fetch in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`,
        );

        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          fetchWalletAlias();
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [user, address, retryCount]);

  const fetchUserAliases = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      Logger.info("Fetching user aliases");

      const { data, error: fetchError } = await supabase
        .from("wallet_aliases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAliases(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;

      Logger.error("Error fetching user aliases", {
        error: errorMessage,
        stack: errorStack,
      });

      setError("Failed to fetch wallet aliases");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch the current user's wallet alias
  useEffect(() => {
    if (user && address) {
      fetchWalletAlias();
    }
  }, [user, address, fetchWalletAlias]);

  // Fetch all wallet aliases for the current user
  useEffect(() => {
    if (user) {
      fetchUserAliases();
    }
  }, [user, fetchUserAliases]);

  const setWalletAlias = async (newAlias: string) => {
    if (!user || !address) {
      setError("User or wallet not connected");
      return false;
    }

    if (!newAlias.trim()) {
      setError("Alias cannot be empty");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      Logger.info("Setting wallet alias", { address, alias: newAlias });

      // Check if alias is already taken
      const { data: existingAlias, error: checkError } = await supabase
        .from("wallet_aliases")
        .select("id")
        .eq("alias", newAlias)
        .not("user_id", "eq", user.id) // Allow user to reuse their own aliases
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        throw checkError;
      }

      if (existingAlias) {
        setError("This alias is already taken");
        return false;
      }

      // Check if this wallet already has an alias for this user
      const { data: existingWalletAlias, error: walletCheckError } =
        await supabase
          .from("wallet_aliases")
          .select("id")
          .eq("user_id", user.id)
          .eq("wallet_address", address)
          .maybeSingle();

      if (walletCheckError && walletCheckError.code !== "PGRST116") {
        throw walletCheckError;
      }

      let result;

      if (existingWalletAlias) {
        // Update existing alias
        result = await supabase
          .from("wallet_aliases")
          .update({ alias: newAlias, updated_at: new Date().toISOString() })
          .eq("id", existingWalletAlias.id);
      } else {
        // Create new alias
        result = await supabase.from("wallet_aliases").insert({
          user_id: user.id,
          wallet_address: address,
          alias: newAlias,
        });
      }

      if (result.error) {
        throw result.error;
      }

      setAlias(newAlias);
      await fetchUserAliases(); // Refresh the list of aliases
      showToast(
        "success",
        "Wallet alias updated",
        "Your wallet alias has been successfully updated",
      );
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to set wallet alias";
      const errorStack = err instanceof Error ? err.stack : undefined;

      Logger.error("Error setting wallet alias", {
        error: message,
        stack: errorStack,
      });

      setError(message);
      showToast("error", "Error", message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteWalletAlias = async (aliasId: string) => {
    if (!user) {
      setError("User not connected");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      Logger.info("Deleting wallet alias", { aliasId });

      const { error: deleteError } = await supabase
        .from("wallet_aliases")
        .delete()
        .eq("id", aliasId)
        .eq("user_id", user.id); // Ensure user can only delete their own aliases

      if (deleteError) {
        throw deleteError;
      }

      // Refresh the list of aliases
      await fetchUserAliases();

      // If the deleted alias was for the current wallet, clear the current alias
      if (address) {
        await fetchWalletAlias();
      }

      showToast(
        "success",
        "Wallet alias deleted",
        "Your wallet alias has been successfully removed",
      );
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete wallet alias";
      const errorStack = err instanceof Error ? err.stack : undefined;

      Logger.error("Error deleting wallet alias", {
        error: message,
        stack: errorStack,
      });

      setError(message);
      showToast("error", "Error", message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get alias for any wallet address (for display in leaderboards, etc.)
  const getAliasForAddress = async (
    walletAddress: string,
  ): Promise<string | null> => {
    try {
      Logger.info("Getting alias for address", { walletAddress });

      const { data, error } = await supabase
        .from("wallet_aliases")
        .select("alias")
        .eq("wallet_address", walletAddress)
        .maybeSingle();

      if (error) {
        Logger.warn("No alias found for address", {
          walletAddress,
          error: error.message,
        });
        return null;
      }

      return data?.alias || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;

      Logger.error("Error getting alias for address", {
        error: errorMessage,
        stack: errorStack,
        address: walletAddress,
      });

      return null;
    }
  };

  return {
    alias,
    aliases,
    loading,
    error,
    setWalletAlias,
    deleteWalletAlias,
    getAliasForAddress,
    refreshAliases: fetchUserAliases,
  };
}
