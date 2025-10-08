import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useWeb3 } from '@/contexts/Web3Context';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Logger } from '@/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requireWallet?: boolean;
  allowWalletOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireWallet = false,
  allowWalletOnly = false
}) => {
  const location = useLocation();
  const { user, userType } = useAuth();
  const { loading: profileLoading } = useProfile(); // profile variable prefixed as unused
  const { isConnected: isWalletConnected, connect } = useWeb3();

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
    Logger.info('Unauthorized access attempt', {
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements (skip if wallet-only access without user)
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(userType || '')) {
    Logger.warn('Invalid role access attempt', {
      path: location.pathname,
      userRole: userType,
      requiredRoles,
      timestamp: new Date().toISOString()
    });

    // Redirect to appropriate dashboard based on user type
    if (userType === 'donor') {
      return <Navigate to="/give-dashboard" replace />;
    } else if (userType === 'charity') {
      return <Navigate to="/charity-portal" replace />;
    } else if (userType === 'admin') {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  // Check wallet connection
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

  return children;
};