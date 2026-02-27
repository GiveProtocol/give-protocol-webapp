import React, { useState, useEffect, useCallback } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { Building2, Users } from "lucide-react";
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

interface LoginHelpersProps {
  onForgotUsername: () => void;
  onForgotPassword: () => void;
}

const LoginHelpers: React.FC<LoginHelpersProps> = ({
  onForgotUsername,
  onForgotPassword,
}) => (
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
        onClick={onForgotUsername}
        className="text-sm text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-2 py-1"
        aria-label="Recover forgotten username"
      >
        Forgot username?
      </button>
      <button
        type="button"
        onClick={onForgotPassword}
        className="text-sm text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-2 py-1"
        aria-label="Recover forgotten password"
      >
        Forgot password?
      </button>
    </div>
  </div>
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
    setView("donor");
  }, []);

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

  // Redirect only if user is fully authenticated
  // (Don't redirect on wallet-only connection - user needs to complete auth)
  if (user) {
    return <Navigate to={from} replace />;
  }

  const visibleClass = visible ? "visible" : "";

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
                onClick={handleDonorView}
                variant="secondary"
                className="p-6 h-auto flex flex-col items-center space-y-2"
              >
                <Users className="h-8 w-8" />
                <span className="text-lg font-medium">Donor Login</span>
                <span className="text-sm text-gray-500">
                  For donors and volunteers
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
      case "donor":
        return (
          <>
            <div className="mb-6">
              <button
                onClick={handleSelectView}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                &larr; Back to selection
              </button>
              <h2 className="mt-4 text-2xl font-semibold text-center">
                Donor Login
              </h2>
              <p className="text-center text-sm text-gray-600 mt-1">
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
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                &larr; Back to selection
              </button>
              <h2 className="mt-4 text-2xl font-semibold text-center">
                Charity Portal Login
              </h2>
              <p className="text-center text-sm text-gray-600 mt-1">
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        {/* Logo — first to appear */}
        <div
          className={`frame-reveal ${visibleClass} flex justify-center mb-8`}
          style={{ "--reveal-delay": "0.05s" } as React.CSSProperties}
        >
          <Link to="/" className="flex items-center">
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
