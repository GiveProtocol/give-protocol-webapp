/**
 * Hook for managing wallet connection prompt state
 * Persists user's dismissal preference in localStorage
 */

import { useState, useCallback, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useAuth } from "@/contexts/AuthContext";
import { Logger } from "@/utils/logger";

/** Storage key for wallet prompt dismissal state */
const WALLET_PROMPT_DISMISSED_KEY = "give_protocol_wallet_prompt_dismissed";

/** Storage key for the timestamp when prompt was dismissed */
const WALLET_PROMPT_DISMISSED_AT_KEY = "give_protocol_wallet_prompt_dismissed_at";

/** How long to remember the dismissal (24 hours in ms) */
const DISMISSAL_DURATION = 24 * 60 * 60 * 1000;

interface WalletPromptState {
  /** Whether to show the wallet connection modal */
  showModal: boolean;
  /** Whether to show the reminder banner */
  showBanner: boolean;
  /** Dismiss the modal (user clicks "Skip for now") */
  dismissModal: () => void;
  /** Dismiss the banner entirely */
  dismissBanner: () => void;
  /** Called when wallet is successfully connected */
  onWalletConnected: () => void;
  /** Reset the prompt state (e.g., after logout) */
  resetPromptState: () => void;
}

/**
 * Checks if the wallet prompt has been dismissed and if the dismissal is still valid
 * @returns Whether the dismissal is still active
 */
function isDismissalActive(): boolean {
  try {
    const dismissed = localStorage.getItem(WALLET_PROMPT_DISMISSED_KEY);
    if (dismissed !== "true") return false;

    const dismissedAt = localStorage.getItem(WALLET_PROMPT_DISMISSED_AT_KEY);
    if (!dismissedAt) return false;

    const dismissedTime = Number.parseInt(dismissedAt, 10);
    const now = Date.now();

    // Check if dismissal has expired
    if (now - dismissedTime > DISMISSAL_DURATION) {
      // Clear expired dismissal
      localStorage.removeItem(WALLET_PROMPT_DISMISSED_KEY);
      localStorage.removeItem(WALLET_PROMPT_DISMISSED_AT_KEY);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Hook to manage wallet connection prompt display logic
 *
 * Flow:
 * 1. User logs in -> Check wallet connection
 * 2. Wallet not connected AND not previously dismissed -> Show modal
 * 3. User dismisses modal -> Show banner, save dismissal to localStorage
 * 4. User dismisses banner -> Hide banner, save dismissal
 * 5. User connects wallet -> Hide both modal and banner
 *
 * @returns WalletPromptState with visibility flags and action handlers
 */
export function useWalletPrompt(): WalletPromptState {
  const { isConnected } = useWeb3();
  const { user } = useAuth();

  // Track if modal has been dismissed this session
  const [modalDismissed, setModalDismissed] = useState(false);
  // Track if banner has been dismissed
  const [bannerDismissed, setBannerDismissed] = useState(() => isDismissalActive());
  // Track if this is the initial render after login
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  // Reset state when user logs out
  useEffect(() => {
    if (!user) {
      setModalDismissed(false);
      setHasShownPrompt(false);
      // Note: We don't reset bannerDismissed here because we want to
      // remember the user's preference even across login sessions
    }
  }, [user]);

  // Check localStorage on mount and when user changes
  useEffect(() => {
    setBannerDismissed(isDismissalActive());
  }, [user?.id]);

  // Determine what to show
  const showModal =
    Boolean(user) && // User is logged in
    !isConnected && // Wallet not connected
    !modalDismissed && // Modal not dismissed this session
    !bannerDismissed && // Not previously dismissed
    !hasShownPrompt; // Haven't shown yet this session

  const showBanner =
    Boolean(user) && // User is logged in
    !isConnected && // Wallet not connected
    modalDismissed && // Modal was dismissed
    !bannerDismissed; // Banner not dismissed

  // Mark prompt as shown when modal opens
  useEffect(() => {
    if (showModal && !hasShownPrompt) {
      setHasShownPrompt(true);
      Logger.info("Showing wallet connection modal");
    }
  }, [showModal, hasShownPrompt]);

  const dismissModal = useCallback(() => {
    setModalDismissed(true);
    Logger.info("Wallet connection modal dismissed");
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    try {
      localStorage.setItem(WALLET_PROMPT_DISMISSED_KEY, "true");
      localStorage.setItem(WALLET_PROMPT_DISMISSED_AT_KEY, Date.now().toString());
      Logger.info("Wallet reminder banner dismissed, saved to localStorage");
    } catch (err) {
      Logger.warn("Failed to save wallet prompt dismissal to localStorage", {
        error: err,
      });
    }
  }, []);

  const onWalletConnected = useCallback(() => {
    // Clear all prompt states when wallet is connected
    setModalDismissed(false);
    setBannerDismissed(false);
    setHasShownPrompt(false);

    // Clear localStorage dismissal
    try {
      localStorage.removeItem(WALLET_PROMPT_DISMISSED_KEY);
      localStorage.removeItem(WALLET_PROMPT_DISMISSED_AT_KEY);
    } catch {
      // Ignore localStorage errors
    }

    Logger.info("Wallet connected, clearing prompt state");
  }, []);

  const resetPromptState = useCallback(() => {
    setModalDismissed(false);
    setBannerDismissed(false);
    setHasShownPrompt(false);

    try {
      localStorage.removeItem(WALLET_PROMPT_DISMISSED_KEY);
      localStorage.removeItem(WALLET_PROMPT_DISMISSED_AT_KEY);
    } catch {
      // Ignore localStorage errors
    }

    Logger.info("Wallet prompt state reset");
  }, []);

  return {
    showModal,
    showBanner,
    dismissModal,
    dismissBanner,
    onWalletConnected,
    resetPromptState,
  };
}

export default useWalletPrompt;
