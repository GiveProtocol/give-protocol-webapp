import React, { useState, useEffect, useCallback } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { Building2, Users, Loader2 } from "lucide-react";
import { DonorLogin } from "../components/auth/DonorLogin";
import { CharityLogin } from "../components/auth/CharityLogin";
import { ForgotPassword } from "../components/auth/ForgotPassword";
import { ForgotUsername } from "../components/auth/ForgotUsername";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useWeb3 } from "@/contexts/Web3Context";

type View =
  | "select"
  | "donor"
  | "charity"
  | "forgotPassword"
  | "forgotUsername";

/** Duration in ms for the loading simulation on account-type buttons */
const LOADING_SIMULATION_MS = 2000;

interface LoginHelpersProps {
  onForgotUsername: () => void;
  onForgotPassword: () => void;
}

/** Help links below the login form for recovering username or password */
const LoginHelpers: React.FC<LoginHelpersProps> = ({
  onForgotUsername,
  onForgotPassword,
}) => (
  <nav className="mt-6 space-y-4" aria-label="Login help options">
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-base">
        <span className="px-2 bg-white text-gray-700">Need help?</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={onForgotUsername}
        className="text-base text-indigo-700 hover:text-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-md px-3 py-2 min-h-[48px] transition-colors duration-200"
        aria-label="Recover forgotten username"
      >
        Forgot username?
      </button>
      <button
        type="button"
        onClick={onForgotPassword}
        className="text-base text-indigo-700 hover:text-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-md px-3 py-2 min-h-[48px] transition-colors duration-200"
        aria-label="Recover forgotten password"
      >
        Forgot password?
      </button>
    </div>
  </nav>
);

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const [view, setView] = useState<View>(
    typeParam === "charity" ? "charity" : "select",
  );
  const { user, userType } = useAuth();
  const { connect: _connect, isConnecting: _isConnecting, address: _address } = useWeb3();
  const _navigate = useNavigate();
  const location = useLocation();

  // Trigger .visible class after mount for staggered entrance animation
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Independent loading states for account type selection buttons
  const [loadingDonor, setLoadingDonor] = useState(false);
  const [loadingCharity, setLoadingCharity] = useState(false);

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

  const handleDonorView = useCallback(() => {
    setLoadingDonor(true);
    setTimeout(() => {
      setLoadingDonor(false);
      setView("donor");
    }, LOADING_SIMULATION_MS);
  }, []);

  const handleCharityView = useCallback(() => {
    setLoadingCharity(true);
    setTimeout(() => {
      setLoadingCharity(false);
      setView("charity");
    }, LOADING_SIMULATION_MS);
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

  // Redirect only if user is fully authenticated
  // (Don't redirect on wallet-only connection - user needs to complete auth)
  if (user) {
    return <Navigate to={from} replace />;
  }

  const visibleClass = visible ? "visible" : "";
  const isLoading = loadingDonor || loadingCharity;

  const renderView = () => {
    switch (view) {
      case "select":
        return (
          <div className="space-y-6" role="group" aria-labelledby="account-type-heading">
            <h1
              id="account-type-heading"
              className="text-xl sm:text-2xl font-semibold text-center text-gray-900"
            >
              Choose Account Type
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleDonorView}
                variant="secondary"
                disabled={isLoading}
                aria-busy={loadingDonor}
                className="p-6 h-auto min-h-[48px] flex flex-col items-center space-y-2 hover:-translate-y-1 hover:shadow-lg active:-translate-y-0.5 transition-all duration-200"
              >
                {loadingDonor ? (
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden="true" />
                ) : (
                  <Users className="h-8 w-8" aria-hidden="true" />
                )}
                <span className="text-lg font-medium">
                  {loadingDonor ? "Loading\u2026" : "Donor Login"}
                </span>
                {!loadingDonor && (
                  <span className="text-base text-gray-600">
                    For donors and volunteers
                  </span>
                )}
              </Button>

              <Button
                onClick={handleCharityView}
                variant="secondary"
                disabled={isLoading}
                aria-busy={loadingCharity}
                className="p-6 h-auto min-h-[48px] flex flex-col items-center space-y-2 hover:-translate-y-1 hover:shadow-lg active:-translate-y-0.5 transition-all duration-200"
              >
                {loadingCharity ? (
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden="true" />
                ) : (
                  <Building2 className="h-8 w-8" aria-hidden="true" />
                )}
                <span className="text-lg font-medium">
                  {loadingCharity ? "Loading\u2026" : "Charity Login"}
                </span>
                {!loadingCharity && (
                  <span className="text-base text-gray-600">
                    For registered charities
                  </span>
                )}
              </Button>
            </div>

            <div className="text-center space-y-2 mt-6">
              <p className="text-base text-gray-700">
                Don&apos;t have an account?
              </p>
              <Link
                to="/register"
                className="inline-block text-base text-teal-700 hover:text-teal-800 font-medium hover:underline decoration-teal-500 decoration-2 underline-offset-4 transition-all duration-200 py-3 px-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                Create new account
              </Link>
            </div>
          </div>
        );
      case "donor":
        return (
          <>
            <div className="mb-6">
              <button
                onClick={handleSelectView}
                className="text-base text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-md px-2 py-2 min-h-[48px] transition-colors duration-200"
                aria-label="Go back to account type selection"
              >
                &larr; Back to selection
              </button>
              <h1 className="mt-4 text-xl sm:text-2xl font-semibold text-center text-gray-900">
                Donor Login
              </h1>
              <p className="text-center text-base text-gray-700 mt-1">
                Sign in to access your giving dashboard
              </p>
            </div>
            <DonorLogin />
            <LoginHelpers onForgotUsername={handleForgotUsername} onForgotPassword={handleForgotPassword} />
          </>
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
                className="text-base text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-md px-2 py-2 min-h-[48px] transition-colors duration-200"
                aria-label="Go back to account type selection"
              >
                &larr; Back to selection
              </button>
              <h1 className="mt-4 text-xl sm:text-2xl font-semibold text-center text-gray-900">
                Charity Portal Login
              </h1>
              <p className="text-center text-base text-gray-700 mt-1">
                Manage your charity profile and donations
              </p>
            </div>
            <CharityLogin />
            <LoginHelpers onForgotUsername={handleForgotUsername} onForgotPassword={handleForgotPassword} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Skip-to-content link for screen readers and keyboard navigation */}
      <a
        href="#login-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:text-indigo-700 focus:ring-2 focus:ring-indigo-500"
      >
        Skip to login content
      </a>

      <div
        id="login-content"
        role="region"
        aria-label="Login"
        className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100"
      >
        {/* Logo — first to appear */}
        <div
          className={`frame-reveal ${visibleClass} flex justify-center mb-8`}
          style={{ "--reveal-delay": "0.05s" } as React.CSSProperties}
        >
          <Link to="/" className="flex items-center" aria-label="Go to homepage">
            <Logo className="h-12 w-12" />
          </Link>
        </div>

        {/* View content — staggered after logo */}
        <div
          className={`frame-reveal ${visibleClass}`}
          style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
        >
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default Login;
