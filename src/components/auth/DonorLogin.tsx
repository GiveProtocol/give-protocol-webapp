import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle } from "lucide-react";

export const DonorLogin: React.FC = () => {
  const { login, loading } = useAuth();
  const { disconnect } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const _from = location.state?.from?.pathname || "/give-dashboard";

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    [],
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    [],
  );

  const handleEmailLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      try {
        await login(email, password, "donor");
        // The login function will handle the redirect to give-dashboard
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to sign in";

        // Check for account type mismatch
        if (message.includes("registered as a charity account")) {
          setError(
            "Donor User Account Not Found. This email is registered as a charity account. Please use the Charity Login.",
          );

          // Disconnect wallet and redirect to login page after a short delay
          await disconnect();
          setTimeout(() => {
            navigate("/login?type=charity");
          }, 3000);
        } else {
          setError(message);
        }
      }
    },
    [email, password, login, disconnect, navigate],
  );

  return (
    <form onSubmit={handleEmailLogin} className="space-y-4" aria-label="Donor login form">
      {error && (
        <div
          className="p-3 bg-red-50 text-red-600 rounded-md flex items-start"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={handleEmailChange}
        variant="enhanced"
        required
        aria-required="true"
      />
      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={handlePasswordChange}
        variant="enhanced"
        required
        aria-required="true"
      />
      <Button type="submit" className="w-full min-h-[48px]" disabled={loading} aria-busy={loading}>
        {loading ? "Signing in\u2026" : "Sign In"}
      </Button>
    </form>
  );
};
