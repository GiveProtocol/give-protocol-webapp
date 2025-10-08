import React, { useState, useCallback } from "react";
import { Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
          value={formData.email}
          onChange={handleChange}
          required
          aria-required="true"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          helperText="Must be at least 8 characters long"
          required
          aria-required="true"
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          aria-required="true"
        />

        <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
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
        <Mail className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
    </div>
  );
};
