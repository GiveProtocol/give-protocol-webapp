import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { MAX_CAUSES_PER_CHARITY } from "@/types/charity";
import { useTranslation } from "@/hooks/useTranslation";
import { Logger } from "@/utils/logger";
import { AlertCircle, AlertTriangle } from "lucide-react";

/** Available categories for causes */
const CAUSE_CATEGORIES = [
  "Education",
  "Healthcare",
  "Environment",
  "Water & Sanitation",
  "Hunger & Poverty",
  "Animal Welfare",
  "Disaster Relief",
  "Human Rights",
  "Community Development",
  "Arts & Culture",
  "Other",
] as const;

interface CauseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CauseForm: React.FC<CauseFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    category: CAUSE_CATEGORIES[0],
    imageUrl: "",
    imagePath: "",
    impact: "",
    timeline: "",
    location: "",
    partners: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [activeCauseCount, setActiveCauseCount] = useState<number>(0);
  const [checkingLimit, setCheckingLimit] = useState(true);

  // Check how many active causes the charity already has
  useEffect(() => {
    const checkCauseLimit = async () => {
      if (!profile?.id) {
        setCheckingLimit(false);
        return;
      }

      try {
        const { count, error: countError } = await supabase
          .from("causes")
          .select("*", { count: "exact", head: true })
          .eq("charity_id", profile.id)
          .eq("status", "active");

        if (countError) {
          Logger.warn("Error checking cause count", { error: countError });
        } else {
          setActiveCauseCount(count ?? 0);
        }
      } catch (err) {
        Logger.warn("Exception checking cause count", { error: err });
      } finally {
        setCheckingLimit(false);
      }
    };

    checkCauseLimit();
  }, [profile?.id]);

  const hasReachedLimit = activeCauseCount >= MAX_CAUSES_PER_CHARITY;

  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case "name":
        return value.trim().length > 0 ? "" : "Cause name is required";
      case "description":
        return value.trim().length > 0 ? "" : "Description is required";
      case "targetAmount": {
        const amount = Number.parseFloat(value);
        if (!value.trim()) return "Target amount is required";
        if (Number.isNaN(amount) || amount <= 0)
          return "Target amount must be a positive number";
        return "";
      }
      case "location":
        return value.trim().length > 0 ? "" : "Location is required";
      default:
        return "";
    }
  }, []);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

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

  const handleImageChange = useCallback(
    (url: string | null, path: string | null) => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: url ?? "",
        imagePath: path ?? "",
      }));
    },
    [],
  );

  /**
   * Parse textarea content into array of strings
   * Each non-empty line becomes an array item
   */
  const parseTextareaToArray = (text: string): string[] => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!profile?.id) {
        setError("User profile not found");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setValidationErrors({});

        // Validate all required fields
        const errors: Record<string, string> = {};

        const fieldsToValidate = [
          { name: "name", value: formData.name },
          { name: "description", value: formData.description },
          { name: "targetAmount", value: formData.targetAmount },
          { name: "location", value: formData.location },
        ];

        fieldsToValidate.forEach(({ name, value }) => {
          const fieldError = validateField(name, value);
          if (fieldError) {
            errors[name] = fieldError;
          }
        });

        // If there are validation errors, don't submit
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          throw new Error("Please correct the validation errors");
        }

        Logger.info("Creating cause", {
          charityId: profile.id,
          name: formData.name.trim(),
        });

        const { error: submitError } = await supabase.from("causes").insert({
          charity_id: profile.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          target_amount: Number.parseFloat(formData.targetAmount),
          raised_amount: 0,
          category: formData.category,
          image_url: formData.imageUrl || null,
          image_path: formData.imagePath || null,
          impact: parseTextareaToArray(formData.impact),
          timeline: formData.timeline.trim() || null,
          location: formData.location.trim(),
          partners: parseTextareaToArray(formData.partners),
          status: "active",
        });

        if (submitError) throw submitError;

        Logger.info("Cause created", {
          charityId: profile.id,
          name: formData.name,
        });

        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/charity-portal");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create cause";
        setError(errorMessage);
        Logger.error("Failed to create cause", { error: err });
      } finally {
        setLoading(false);
      }
    },
    [formData, profile?.id, onSuccess, navigate, validateField],
  );

  const getSubmitButtonText = (): string => {
    if (loading) {
      return t("common.creating", "Creating...");
    }
    if (checkingLimit) {
      return t("common.loading", "Loading...");
    }
    return t("cause.createCause", "Create Cause");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("cause.createCause", "Create Cause")}
      </h2>

      {hasReachedLimit && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {t("cause.limitReached", "Cause Limit Reached")}
            </p>
            <p className="text-sm mt-1">
              {t(
                "cause.limitReachedMessage",
                `You have reached the maximum of ${MAX_CAUSES_PER_CHARITY} active causes. Please complete or pause an existing cause before creating a new one.`,
              )}
            </p>
          </div>
        </div>
      )}

      {!hasReachedLimit && !checkingLimit && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm">
          {t(
            "cause.causeCount",
            `You have ${activeCauseCount} of ${MAX_CAUSES_PER_CHARITY} active causes.`,
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={t("cause.name", "Cause Name")}
          name="name"
          value={formData.name}
          onChange={handleChange}
          variant="enhanced"
          placeholder="e.g., Clean Water Initiative"
          required
          error={validationErrors["name"]}
        />

        <div>
          <label
            htmlFor="cause-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("cause.description", "Description")}
          </label>
          <textarea
            id="cause-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="block w-full border-[1.5px] border-[#e1e4e8] rounded-lg px-4 py-3 text-base transition-all duration-200 bg-[#fafbfc] focus:border-[#0366d6] focus:shadow-[0_0_0_3px_rgba(3,102,214,0.1)] focus:bg-white focus:outline-none"
            placeholder="Describe your cause and its goals..."
            required
          />
          {validationErrors["description"] && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors["description"]}
            </p>
          )}
        </div>

        <ImageUpload
          value={formData.imageUrl}
          onChange={handleImageChange}
          folder={`causes/${profile?.id ?? "unknown"}`}
          label={t("cause.headerImage", "Header Image")}
          helpText={t(
            "cause.headerImageHelp",
            "Upload an image to display at the top of your cause page",
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t("cause.targetAmount", "Funding Target ($)")}
            name="targetAmount"
            type="number"
            min="1"
            step="0.01"
            value={formData.targetAmount}
            onChange={handleChange}
            variant="enhanced"
            placeholder="e.g., 50000"
            required
            error={validationErrors["targetAmount"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("cause.category", "Category")}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="block w-full border-[1.5px] border-[#e1e4e8] rounded-lg px-4 py-3 text-base transition-all duration-200 bg-[#fafbfc] focus:border-[#0366d6] focus:shadow-[0_0_0_3px_rgba(3,102,214,0.1)] focus:bg-white focus:outline-none"
              required
            >
              {CAUSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {t(
                    `cause.category.${category.toLowerCase().replace(/ & /g, "_")}`,
                    category,
                  )}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t("cause.location", "Location")}
            name="location"
            value={formData.location}
            onChange={handleChange}
            variant="enhanced"
            placeholder="e.g., East Africa, Global, New York"
            required
            error={validationErrors["location"]}
          />

          <Input
            label={t("cause.timeline", "Timeline")}
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            variant="enhanced"
            placeholder="e.g., 2024-2025, Ongoing"
          />
        </div>

        <div>
          <label
            htmlFor="cause-impact"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("cause.impact", "Impact Highlights")}
            <span className="text-gray-500 font-normal ml-1">
              (one per line)
            </span>
          </label>
          <textarea
            id="cause-impact"
            name="impact"
            value={formData.impact}
            onChange={handleChange}
            rows={4}
            className="block w-full border-[1.5px] border-[#e1e4e8] rounded-lg px-4 py-3 text-base transition-all duration-200 bg-[#fafbfc] focus:border-[#0366d6] focus:shadow-[0_0_0_3px_rgba(3,102,214,0.1)] focus:bg-white focus:outline-none"
            placeholder="Provided clean water to 10,000 people&#10;Built 50 water wells&#10;Trained 200 local technicians"
          />
          <p className="mt-1 text-sm text-gray-500">
            {t("cause.impactHelp", "Enter each impact statement on a new line")}
          </p>
        </div>

        <div>
          <label
            htmlFor="cause-partners"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("cause.partners", "Key Partners")}
            <span className="text-gray-500 font-normal ml-1">
              (one per line)
            </span>
          </label>
          <textarea
            id="cause-partners"
            name="partners"
            value={formData.partners}
            onChange={handleChange}
            rows={3}
            className="block w-full border-[1.5px] border-[#e1e4e8] rounded-lg px-4 py-3 text-base transition-all duration-200 bg-[#fafbfc] focus:border-[#0366d6] focus:shadow-[0_0_0_3px_rgba(3,102,214,0.1)] focus:bg-white focus:outline-none"
            placeholder="UNICEF&#10;Local Government&#10;Community Organizations"
          />
          <p className="mt-1 text-sm text-gray-500">
            {t(
              "cause.partnersHelp",
              "Enter each partner organization on a new line",
            )}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              {t("common.cancel", "Cancel")}
            </Button>
          )}

          <Button
            type="submit"
            disabled={loading || hasReachedLimit || checkingLimit}
          >
            {getSubmitButtonText()}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CauseForm;
