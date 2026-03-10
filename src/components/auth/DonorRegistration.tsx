import React, { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { validateEmail, validatePassword } from "@/utils/validation";

export const DonorRegistration: React.FC = () => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      // Validate inputs
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (!validatePassword(formData.password)) {
        setError("Password must be at least 8 characters long");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      try {
        await register(formData.email, formData.password, "donor", {
          type: "donor", // Explicitly set type to ensure it's stored in metadata
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create account";
        setError(message);
      }
    },
    [formData, register],
  );

  const handleGoogleOAuth = useCallback(() => {
    // Google OAuth integration placeholder
    // Full implementation pending OAuth provider configuration
  }, []);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Donor registration form">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          variant="fintech"
          value={formData.email}
          onChange={handleChange}
          required
          aria-required="true"
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            variant="fintech"
            value={formData.password}
            onChange={handleChange}
            required
            aria-required="true"
          />
          <PasswordStrengthBar password={formData.password} />
        </div>

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          variant="fintech"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          aria-required="true"
        />

        <Button
          type="submit"
          className="w-full bg-gradient-to-b from-indigo-500 to-indigo-600 border border-indigo-700 shadow-none hover:from-indigo-600 hover:to-indigo-700 hover:shadow-none"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Creating Account..." : "Create Donor Account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleGoogleOAuth}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
};
