import React, { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCountries } from "@/hooks/useCountries";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhoneNumber,
} from "@/utils/validation";
import { AlertCircle } from "lucide-react";

export const CharityVettingForm: React.FC = () => {
  const { register, loading } = useAuth();
  const { countries } = useCountries();
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [formData, setFormData] = useState({
    organizationName: "",
    description: "",
    category: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    taxId: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError("");

      // Clear validation error for this field
      if (validationErrors[name]) {
        setValidationErrors((prev) => {
          const { [name]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [validationErrors],
  );

  const validateField = useCallback(
    (name: string, value: string): string => {
      switch (name) {
        case "organizationName":
          return validateName(value)
            ? ""
            : "Organization name must be between 2 and 100 characters";
        case "contactName":
          return validateName(value)
            ? ""
            : "Contact name must be between 2 and 100 characters";
        case "contactEmail":
          return validateEmail(value)
            ? ""
            : "Please enter a valid email address";
        case "contactPhone":
          return validatePhoneNumber(value)
            ? ""
            : "Please enter a valid phone number";
        case "password":
          return validatePassword(value)
            ? ""
            : "Password must be at least 8 characters long";
        case "confirmPassword":
          return value === formData.password ? "" : "Passwords do not match";
        default:
          return "";
      }
    },
    [formData.password],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setValidationErrors({});

      // Validate all fields
      const errors: Record<string, string> = {};

      // Required fields to validate
      const fieldsToValidate = [
        { name: "organizationName", value: formData.organizationName },
        { name: "contactName", value: formData.contactName },
        { name: "contactEmail", value: formData.contactEmail },
        { name: "contactPhone", value: formData.contactPhone },
        { name: "password", value: formData.password },
        { name: "confirmPassword", value: formData.confirmPassword },
      ];

      fieldsToValidate.forEach(({ name, value }) => {
        const error = validateField(name, value);
        if (error) {
          errors[name] = error;
        }
      });

      // Additional required fields
      if (!formData.description.trim()) {
        errors["description"] = "Description is required";
      }

      if (!formData.category.trim()) {
        errors["category"] = "Category is required";
      }

      if (!formData.taxId.trim()) {
        errors["taxId"] = "Tax ID is required";
      }

      if (!formData.streetAddress.trim()) {
        errors["streetAddress"] = "Street address is required";
      }

      if (!formData.city.trim()) {
        errors["city"] = "City is required";
      }

      if (!formData.country) {
        errors["country"] = "Country is required";
      }

      // If there are validation errors, don't submit
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError("Please correct the validation errors");
        return;
      }

      try {
        await register(formData.contactEmail, formData.password, "charity", {
          organizationName: formData.organizationName,
          description: formData.description,
          category: formData.category,
          type: "charity", // Explicitly set type to ensure it's stored in metadata
          address: {
            street: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postalCode: formData.postalCode,
          },
          taxId: formData.taxId,
          contact: {
            name: formData.contactName,
            phone: formData.contactPhone,
          },
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to submit application";
        setError(message);
      }
    },
    [formData, register, validateField],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900">
        Organization Details
      </h3>
      <Input
        label="Organization Name"
        name="organizationName"
        value={formData.organizationName}
        onChange={handleChange}
        required
        error={validationErrors["organizationName"]}
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Description{" "}
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-indigo-50 mt-1"
          required
        />
        {validationErrors["description"] && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors["description"]}
          </p>
        )}
      </label>

      <Input
        label="Category of Entity"
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
        error={validationErrors["category"]}
      />

      <Input
        label="Tax or Registration ID"
        name="taxId"
        value={formData.taxId}
        onChange={handleChange}
        required
        error={validationErrors["taxId"]}
      />

      <h3 className="text-lg font-semibold text-gray-900">Address</h3>
      <Input
        label="Street Address"
        name="streetAddress"
        value={formData.streetAddress}
        onChange={handleChange}
        required
        error={validationErrors["streetAddress"]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          error={validationErrors["city"]}
        />
        <Input
          label="State/Province"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
          error={validationErrors["state"]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-1 block">
            Country
          </span>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-indigo-50"
            required
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {validationErrors["country"] && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors["country"]}
            </p>
          )}
        </label>
        <Input
          label="Postal Code"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          required
          error={validationErrors["postalCode"]}
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        Contact Information
      </h3>
      <Input
        label="Contact Name"
        name="contactName"
        value={formData.contactName}
        onChange={handleChange}
        required
        error={validationErrors["contactName"]}
      />
      <Input
        label="Contact Email"
        type="email"
        name="contactEmail"
        value={formData.contactEmail}
        onChange={handleChange}
        required
        error={validationErrors["contactEmail"]}
      />
      <Input
        label="Contact Phone"
        type="tel"
        name="contactPhone"
        value={formData.contactPhone}
        onChange={handleChange}
        required
        error={validationErrors["contactPhone"]}
      />

      <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        error={validationErrors["password"]}
      />
      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        error={validationErrors["confirmPassword"]}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting Application..." : "Submit Charity Application"}
      </Button>
    </form>
  );
};
