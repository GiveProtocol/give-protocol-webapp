import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWeb3 } from "@/contexts/Web3Context";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Logger } from "@/utils/logger";
import { WalletConnectionModal } from "@/components/wallet/WalletConnectionModal";
import { WalletReminderBanner } from "@/components/wallet/WalletReminderBanner";
import { useWalletPrompt } from "@/hooks/useWalletPrompt";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  /** Block access until wallet is connected (shows full-page prompt) */
  requireWallet?: boolean;
  /** Allow access with just a connected wallet (no user auth needed) */
  allowWalletOnly?: boolean;
  /** Show wallet connection modal/banner after login (non-blocking) */
  promptWallet?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireWallet = false,
  allowWalletOnly = false,
  promptWallet = false,
}) => {
  const location = useLocation();
  const { user, userType } = useAuth();
  const { loading: profileLoading } = useProfile();
  const { isConnected: isWalletConnected, connect } = useWeb3();
  const {
    showModal,
    showBanner,
    dismissModal,
    dismissBanner,
    onWalletConnected,
  } = useWalletPrompt();

  // Handle loading states - only show loading if we need user auth and profile is loading
  if (profileLoading && !allowWalletOnly) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check authentication - allow wallet-only access if specified
  if (!user && !(allowWalletOnly && isWalletConnected)) {
    Logger.info("Unauthorized access attempt", {
      path: location.pathname,
      timestamp: new Date().toISOString(),
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements (skip if wallet-only access without user)
  if (
    requiredRoles.length > 0 &&
    user &&
    !requiredRoles.includes(userType || "")
  ) {
    Logger.warn("Invalid role access attempt", {
      path: location.pathname,
      userRole: userType,
      requiredRoles,
      timestamp: new Date().toISOString(),
    });

    // Redirect to appropriate dashboard based on user type
    if (userType === "donor") {
      return <Navigate to="/give-dashboard" replace />;
    } else if (userType === "charity") {
      return <Navigate to="/charity-portal" replace />;
    } else if (userType === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  // Check wallet connection (blocking requirement)
  if (requireWallet && !isWalletConnected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-semibold">Wallet Connection Required</h2>
        <p className="text-gray-600">Please connect your wallet to continue</p>
        <button
          onClick={connect}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // Render with optional wallet prompt (non-blocking)
  if (promptWallet) {
    return (
      <>
        {/* Wallet connection modal - shown after login if wallet not connected */}
        <WalletConnectionModal
          isOpen={showModal}
          onClose={dismissModal}
          onConnected={onWalletConnected}
        />

        {/* Wallet reminder banner - shown if modal was dismissed */}
        {showBanner && (
          <WalletReminderBanner
            onDismiss={dismissBanner}
            onConnected={onWalletConnected}
          />
        )}

        {children}
      </>
    );
  }

  return children;
};
