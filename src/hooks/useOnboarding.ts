import { useState, useEffect, useCallback, startTransition } from "react";

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
  // SSR-safe default: assume onboarding complete on server to match hydration
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

  // Derive modal visibility from onboarding state
  const [showChainSelection, setShowChainSelection] = useState(false);

  // Hydrate onboarding status from localStorage after mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isComplete = localStorage.getItem(ONBOARDING_KEY) === "true";

    startTransition(() => {
      setHasCompletedOnboarding(isComplete);
      if (!isComplete) {
        setShowChainSelection(true);
      }
    });
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
