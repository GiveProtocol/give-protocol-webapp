import React, { useState, useEffect, useCallback } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { Building2, Wallet, Plus } from "lucide-react";
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

/** Tray below the nonprofit login form linking to charity registration. */
const NonprofitOnboardingTray: React.FC = () => (
  <div className="mt-8 rounded-xl bg-emerald-50/60 border border-emerald-100 px-5 py-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-px bg-emerald-200" />
      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
        New to Give Protocol?
      </span>
      <div className="flex-1 h-px bg-emerald-200" />
    </div>

    <Link
      to="/register?type=charity"
      className="flex items-center gap-3 rounded-xl bg-white border border-emerald-200 p-4 hover:border-emerald-400 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors flex-shrink-0">
        <Plus className="h-5 w-5 text-emerald-700" />
      </div>
      <div>
        <span className="text-sm font-bold text-gray-900 block">
          Create a Nonprofit Account
        </span>
        <span className="text-xs text-emerald-700">
          Register your organization on Give Protocol
        </span>
      </div>
    </Link>
  </div>
);

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
        className="text-base text-emerald-700 hover:text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-md px-3 py-2 min-h-[48px] transition-colors duration-200"
        aria-label="Recover forgotten username"
      >
        Forgot username?
      </button>
      <button
        type="button"
        onClick={onForgotPassword}
        className="text-base text-emerald-700 hover:text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-md px-3 py-2 min-h-[48px] transition-colors duration-200"
        aria-label="Recover forgotten password"
      >
        Forgot password?
      </button>
    </div>
  </nav>
);

/** Login page component that handles account type selection, donor/charity login, and password recovery flows. */
const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const [view, setView] = useState<View>(
    typeParam === "charity" ? "charity" : "select",
  );
  const { user, userType, loginWithApple } = useAuth();
  const { connect, isConnecting, address: _address } = useWeb3();
  const _navigate = useNavigate();
  const location = useLocation();

  // Trigger .visible class after mount for staggered entrance animation
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Get the intended destination from location state, or default to dashboard
  const from =
    location.state?.from?.pathname ||
    (userType === "charity" ? "/charity-portal" : "/give-dashboard");

  // Memoized handlers
  const handleForgotUsername = useCallback(() => {
    setView("forgotUsername");
  }, []);

  const handleForgotPassword = useCallback(() => {
    setView("forgotPassword");
  }, []);

  const handleDonorView = useCallback(() => {
    setView("donor");
  }, []);

  const handleCharityView = useCallback(() => {
    setView("charity");
  }, []);

  const handleSelectView = useCallback(() => {
    setView("select");
  }, []);

  const handleWalletConnect = useCallback(() => {
    connect();
  }, [connect]);

  const handleAppleLogin = useCallback(async () => {
    try {
      await loginWithApple();
    } catch (_err) {
      // Error handled by AuthContext
    }
  }, [loginWithApple]);

  // Set view based on URL parameter on mount and when it changes
  useEffect(() => {
    if (typeParam === "charity") {
      setView("charity");
    }
  }, [typeParam]);

  // Redirect only if user is fully authenticated
  if (user) {
    return <Navigate to={from} replace />;
  }

  const visibleClass = visible ? "visible" : "";

  /** Renders the appropriate login view based on the current view state. */
  const renderView = () => {
    switch (view) {
      case "select":
        return (
          <div className="space-y-6">
            {/* Primary CTA — email/password login */}
            <Button
              onClick={handleDonorView}
              fullWidth
              size="lg"
              className="font-semibold"
            >
              Continue as Donor
            </Button>

            {/* Secondary CTA — wallet connect */}
            <Button
              onClick={handleWalletConnect}
              variant="secondary"
              fullWidth
              size="lg"
              icon={<Wallet className="h-5 w-5" />}
              disabled={isConnecting}
              className="font-semibold"
            >
              {isConnecting ? "Connecting\u2026" : "Connect Wallet & Sign In"}
            </Button>

            {/* Apple Sign In */}
            <button
              type="button"
              onClick={handleAppleLogin}
              className="w-full flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 transition-colors duration-200"
              aria-label="Sign in with Apple"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Sign in with Apple
            </button>

            {/* Sign up prompt */}
            <div className="text-center space-y-1 pt-2">
              <p className="text-sm text-gray-500">New to Give Protocol?</p>
              <Link
                to="/register"
                className="inline-block text-sm text-emerald-700 hover:text-emerald-800 font-semibold hover:underline decoration-emerald-500 decoration-2 underline-offset-4 transition-all duration-200 py-1 px-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                New Donor Sign Up
              </Link>
            </div>

            {/* Nonprofit footer section */}
            <div className="border-t border-gray-100 pt-5 mt-2">
              <button
                type="button"
                onClick={handleCharityView}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group"
              >
                <Building2 className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                  I manage a Nonprofit Profile
                </span>
              </button>
            </div>
          </div>
        );
      case "donor":
        return (
          <>
            <div className="mb-6">
              <button
                onClick={handleSelectView}
                className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-md px-2 py-2 min-h-[44px] transition-colors duration-200"
                aria-label="Go back to sign in options"
              >
                &larr; Back
              </button>
              <h2 className="mt-3 text-xl font-semibold text-center text-gray-900">
                Donor Sign In
              </h2>
              <p className="text-center text-sm text-gray-500 mt-1">
                Sign in to access your giving dashboard
              </p>
            </div>
            <DonorLogin />
            <LoginHelpers
              onForgotUsername={handleForgotUsername}
              onForgotPassword={handleForgotPassword}
            />
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
                className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-md px-2 py-2 min-h-[44px] transition-colors duration-200"
                aria-label="Go back to sign in options"
              >
                &larr; Back
              </button>
              <h2 className="mt-3 text-xl font-semibold text-center text-gray-900">
                Nonprofit Portal
              </h2>
              <p className="text-center text-sm text-gray-500 mt-1">
                Manage your organization profile and donations
              </p>
            </div>
            <CharityLogin />
            <LoginHelpers
              onForgotUsername={handleForgotUsername}
              onForgotPassword={handleForgotPassword}
            />
            <NonprofitOnboardingTray />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Skip-to-content link for screen readers */}
      <a
        href="#login-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:text-emerald-700 focus:ring-2 focus:ring-emerald-500"
      >
        Skip to login content
      </a>

      {/* Page heading */}
      <h1
        className={`frame-reveal ${visibleClass} text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-8 tracking-tight`}
        style={{ "--reveal-delay": "0.03s" } as React.CSSProperties}
      >
        Welcome to Give Protocol
      </h1>

      <section
        id="login-content"
        aria-label="Login"
        className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100"
      >
        {/* Logo + card header */}
        <div
          className={`frame-reveal ${visibleClass} flex flex-col items-center mb-6`}
          style={{ "--reveal-delay": "0.05s" } as React.CSSProperties}
        >
          <Link
            to="/"
            className="flex items-center mb-4"
            aria-label="Go to homepage"
          >
            <Logo className="h-12 w-12" />
          </Link>
          <h2 className="text-xl font-semibold text-gray-900">
            Sign In or Connect
          </h2>
        </div>

        {/* View content */}
        <div
          className={`frame-reveal ${visibleClass}`}
          style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
        >
          {renderView()}
        </div>
      </section>
    </div>
  );
};

export default Login;
