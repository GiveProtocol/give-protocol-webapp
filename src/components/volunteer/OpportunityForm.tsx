import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Editor } from "@/components/ui/Editor";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import {
  CommitmentType,
  OpportunityType,
  WorkLanguage,
} from "@/types/volunteer";
import { useTranslation } from "@/hooks/useTranslation";
import { Logger } from "@/utils/logger";
import { AlertCircle } from "lucide-react";

interface OpportunityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const OpportunityForm: React.FC<OpportunityFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: "",
    description: "<p></p>", // Empty paragraph for Tiptap editor
    skills: "",
    commitment: CommitmentType.SHORT_TERM,
    location: "",
    type: OpportunityType.REMOTE,
    workLanguage: WorkLanguage.ENGLISH,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Safely strip HTML by removing individual characters that could form HTML
  // This prevents incomplete multi-character sanitization vulnerabilities
  const stripHtmlTags = (input: string): string => {
    // Remove all < and > characters which are the core of HTML tags
    // This is more secure than trying to match complete tag patterns
    return input.replace(/[<>]/g, "");
  };

  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case "title":
        return value.trim().length > 0 ? "" : "Title is required";
      case "description": {
        // Safely strip HTML tags to check if there's actual content
        const textContent = stripHtmlTags(value).trim();
        return textContent.length > 0 ? "" : "Description is required";
      }
      case "skills":
        return value.trim().length > 0 ? "" : "At least one skill is required";
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

  const handleDescriptionChange = useCallback(
    (content: string) => {
      setFormData((prev) => ({ ...prev, description: content }));
      // Clear validation error for description
      if (validationErrors.description) {
        setValidationErrors((prev) => {
          const { description: _description, ...rest } = prev;
          return rest;
        });
      }
    },
    [validationErrors.description],
  );

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
          { name: "title", value: formData.title },
          { name: "description", value: formData.description },
          { name: "skills", value: formData.skills },
          { name: "location", value: formData.location },
        ];

        fieldsToValidate.forEach(({ name, value }) => {
          const error = validateField(name, value);
          if (error) {
            errors[name] = error;
          }
        });

        // If there are validation errors, don't submit
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          throw new Error("Please correct the validation errors");
        }

        Logger.info("Creating volunteer opportunity", {
          charityId: profile.id,
          title: formData.title.trim(),
        });

        const { error: submitError } = await supabase
          .from("volunteer_opportunities")
          .insert({
            charity_id: profile.id,
            title: formData.title.trim(),
            description: formData.description.trim(),
            skills: formData.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            commitment: formData.commitment,
            location: formData.location.trim(),
            type: formData.type,
            work_language: formData.workLanguage,
            status: "active",
          });

        if (submitError) throw submitError;

        Logger.info("Volunteer opportunity created", {
          charityId: profile.id,
          title: formData.title,
        });

        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/charity-portal");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create opportunity";
        setError(errorMessage);
        Logger.error("Failed to create volunteer opportunity", { error: err });
      } finally {
        setLoading(false);
      }
    },
    [formData, profile?.id, onSuccess, navigate, validateField],
  );

  const formatLanguageName = (language: string): string => {
    return language
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("volunteer.createOpportunity", "Create Volunteer Opportunity")}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={t("volunteer.opportunityTitle", "Opportunity Title")}
          name="title"
          value={formData.title}
          onChange={handleChange}
          variant="enhanced"
          required
          error={validationErrors["title"]}
        />

        <div>
          <label
            htmlFor="opportunity-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("volunteer.description", "Description")}
          </label>
          <Editor
            id="opportunity-description"
            content={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Describe the volunteer opportunity in detail..."
            variant="enhanced"
          />
          {validationErrors["description"] && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors["description"]}
            </p>
          )}
        </div>

        <Input
          label={t("volunteer.skills", "Skills (comma-separated)")}
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          variant="enhanced"
          placeholder="e.g., Web Development, Project Management, Translation"
          required
          error={validationErrors["skills"]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("volunteer.commitment", "Commitment")}
            </label>
            <select
              name="commitment"
              value={formData.commitment}
              onChange={handleChange}
              className="block w-full border-[1.5px] border-[#e1e4e8] rounded-lg px-4 py-3 text-base transition-all duration-200 bg-[#fafbfc] focus:border-[#0366d6] focus:shadow-[0_0_0_3px_rgba(3,102,214,0.1)] focus:bg-white focus:outline-none"
              required
            >
              <option value={CommitmentType.ONE_TIME}>
                {t("volunteer.commitment.oneTime", "One-time")}
              </option>
              <option value={CommitmentType.SHORT_TERM}>
                {t("volunteer.commitment.shortTerm", "Short-term")}
              </option>
              <option value={CommitmentType.LONG_TERM}>
                {t("volunteer.commitment.longTerm", "Long-term")}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("volunteer.type", "Type")}
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="block w-full border-[1.5px] border-[#e1e4e8] rounded-lg px-4 py-3 text-base transition-all duration-200 bg-[#fafbfc] focus:border-[#0366d6] focus:shadow-[0_0_0_3px_rgba(3,102,214,0.1)] focus:bg-white focus:outline-none"
              required
            >
              <option value={OpportunityType.REMOTE}>
                {t("volunteer.type.remote", "Remote")}
              </option>
              <option value={OpportunityType.ONSITE}>
                {t("volunteer.type.onsite", "Onsite")}
              </option>
              <option value={OpportunityType.HYBRID}>
                {t("volunteer.type.hybrid", "Hybrid")}
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t("volunteer.location", "Location")}
            name="location"
            value={formData.location}
            onChange={handleChange}
            variant="enhanced"
            placeholder="e.g., Remote, New York, Berlin"
            required
            error={validationErrors["location"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("volunteer.workLanguage", "Work Language")}
            </label>
            <select
              name="workLanguage"
              value={formData.workLanguage}
              onChange={handleChange}
              className="block w-full border-[1.5px] border-[#e1e4e8] rounded-lg px-4 py-3 text-base transition-all duration-200 bg-[#fafbfc] focus:border-[#0366d6] focus:shadow-[0_0_0_3px_rgba(3,102,214,0.1)] focus:bg-white focus:outline-none"
              required
            >
              {Object.values(WorkLanguage).map((language) => (
                <option key={language} value={language}>
                  {t(`language.${language}`, formatLanguageName(language))}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              {t("common.cancel", "Cancel")}
            </Button>
          )}

          <Button type="submit" disabled={loading}>
            {loading
              ? t("common.creating", "Creating...")
              : t("volunteer.createOpportunity", "Create Opportunity")}
          </Button>
        </div>
      </form>
    </div>
  );
};
