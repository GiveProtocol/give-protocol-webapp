import React, { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { validateEmail, validatePassword } from "@/utils/validation";

/**
 * DonorRegistration component allows users to register as donors by providing email and password.
 * @returns JSX.Element representing the donor registration form.
 */
export const DonorRegistration: React.FC = () => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  /**
   * handleChange updates the form data state when input fields change.
   * @param e - The input change event.
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  }, []);

  /**
   * handleSubmit validates form data and submits registration when the form is submitted.
   * @param e - The form submission event.
   * @returns Promise<void> indicating completion of the submit action.
   */
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

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="Donor registration form"
      >
        {error && (
          <div
            className="p-3 bg-red-50 text-red-600 rounded-md"
            role="alert"
            aria-live="assertive"
          >
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
          className="w-full bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-700 shadow-none hover:from-emerald-600 hover:to-emerald-700 hover:shadow-none"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Creating Account..." : "Create Donor Account"}
        </Button>
      </form>
    </div>
  );
};
