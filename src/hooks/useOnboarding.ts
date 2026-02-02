import { useState, useEffect, useCallback } from "react";

const ONBOARDING_KEY = "giveprotocol_onboarding_complete";

interface UseOnboardingReturn {
  /** Whether the chain selection modal should be shown */
  showChainSelection: boolean;
  /** Mark onboarding as complete */
  completeOnboarding: () => void;
  /** Reset onboarding state (for testing) */
  resetOnboarding: () => void;
  /** Whether onboarding has been completed */
  hasCompletedOnboarding: boolean;
}

/**
 * Hook to manage first-time user onboarding state
 * @returns Onboarding state and actions
 */
export function useOnboarding(): UseOnboardingReturn {
  // Check if onboarding has been completed (SSR-safe)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    if (typeof window === "undefined") return true; // Assume complete on server
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  });

  // Derive modal visibility from onboarding state
  const [showChainSelection, setShowChainSelection] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isComplete = localStorage.getItem(ONBOARDING_KEY) === "true";
    setHasCompletedOnboarding(isComplete);

    // Show chain selection if not completed
    if (!isComplete) {
      setShowChainSelection(true);
    }
  }, []);

  // Mark onboarding as complete
  const completeOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true");
    }
    setHasCompletedOnboarding(true);
    setShowChainSelection(false);
  }, []);

  // Reset onboarding (for testing/debugging)
  const resetOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ONBOARDING_KEY);
    }
    setHasCompletedOnboarding(false);
    setShowChainSelection(true);
  }, []);

  return {
    showChainSelection,
    completeOnboarding,
    resetOnboarding,
    hasCompletedOnboarding,
  };
}
