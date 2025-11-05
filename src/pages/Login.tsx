import React, { useState, useEffect, useCallback } from "react";
import { Link, Navigate, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { Building2, Users } from "lucide-react";
import { CharityLogin } from "../components/auth/CharityLogin";
import { ForgotPassword } from "../components/auth/ForgotPassword";
import { ForgotUsername } from "../components/auth/ForgotUsername";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useWeb3 } from "@/contexts/Web3Context";

type View =
  | "select"
  | "charity"
  | "forgotPassword"
  | "forgotUsername";

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const [view, setView] = useState<View>(
    typeParam === "charity" ? "charity" : "select",
  );
  const { user, userType } = useAuth();
  const { connect, isConnecting, address } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, or default to dashboard
  const from =
    location.state?.from?.pathname ||
    (userType === "charity" ? "/charity-portal" : "/give-dashboard");

  // Memoized handlers for forgot username/password
  const handleForgotUsername = useCallback(() => {
    setView("forgotUsername");
  }, []);

  const handleForgotPassword = useCallback(() => {
    setView("forgotPassword");
  }, []);

  const handleDonorWalletConnect = useCallback(async () => {
    try {
      await connect();
      // Navigation to dashboard will happen via useEffect when address is set
    } catch (error) {
      // Error handling is done in Web3Context
      console.error("Failed to connect wallet:", error);
    }
  }, [connect]);

  const handleCharityView = useCallback(() => {
    setView("charity");
  }, []);

  const handleSelectView = useCallback(() => {
    setView("select");
  }, []);

  // Set view based on URL parameter on mount and when it changes
  useEffect(() => {
    if (typeParam === "charity") {
      setView("charity");
    }
  }, [typeParam]);

  // Navigate to dashboard when wallet is connected
  useEffect(() => {
    if (address && !user) {
      // Wallet connected, navigate to donor dashboard
      navigate("/give-dashboard");
    }
  }, [address, user, navigate]);

  // Redirect if already logged in or wallet connected
  if (user) {
    return <Navigate to={from} replace />;
  }

  if (address && !user) {
    return <Navigate to="/give-dashboard" replace />;
  }

  // LoginHelpers component that provides navigation links to help options
  const LoginHelpers: React.FC = () => (
    <div className="mt-6 space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Need help?</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleForgotUsername}
          className="text-sm text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-2 py-1"
          aria-label="Recover forgotten username"
        >
          Forgot username?
        </button>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-2 py-1"
          aria-label="Recover forgotten password"
        >
          Forgot password?
        </button>
      </div>
    </div>
  );

  const renderView = () => {
    switch (view) {
      case "select":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-900">
              Choose Account Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleDonorWalletConnect}
                variant="secondary"
                className="p-6 h-auto flex flex-col items-center space-y-2"
                disabled={isConnecting}
              >
                <Users className="h-8 w-8" />
                <span className="text-lg font-medium">
                  {isConnecting ? "Connecting..." : "Donor Login"}
                </span>
                <span className="text-sm text-gray-500">
                  Connect wallet for donors and volunteers
                </span>
              </Button>

              <Button
                onClick={handleCharityView}
                variant="secondary"
                className="p-6 h-auto flex flex-col items-center space-y-2"
              >
                <Building2 className="h-8 w-8" />
                <span className="text-lg font-medium">Charity Login</span>
                <span className="text-sm text-gray-500">
                  For registered charities
                </span>
              </Button>
            </div>

            <div className="text-center space-y-2 mt-6">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?
              </p>
              <Link
                to="/register"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Create new account
              </Link>
            </div>
          </div>
        );
      case "forgotPassword":
        return <ForgotPassword onBack={handleSelectView} />;
      case "forgotUsername":
        return <ForgotUsername onBack={handleSelectView} />;
      case "charity":
        return (
          <>
            <div className="mb-6">
              <button
                onClick={handleSelectView}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to selection
              </button>
              <h2 className="mt-4 text-2xl font-semibold text-center">
                Charity Portal Login
              </h2>
              <p className="text-center text-sm text-gray-500 mt-1">
                Manage your charity profile and donations
              </p>
            </div>
            <CharityLogin />
            <LoginHelpers />
          </>
        );
      default:
        // This should never happen as we have all cases covered
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center">
            <Logo className="h-12 w-12" />
          </Link>
        </div>
        {renderView()}
      </div>
    </div>
  );
};

export default Login;
