import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CauseForm } from "@/components/charity/CauseForm";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Page component for creating a new cause.
 * Wraps the CauseForm component with navigation handling.
 */
export const CreateCause: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSuccess = useCallback(() => {
    navigate("/charity-portal");
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate("/charity-portal");
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("cause.createCause", "Create Cause")}
        </h1>
        <p className="mt-2 text-gray-600">
          {t(
            "cause.createCauseDescription",
            "Create a new cause to raise funds for a specific project or initiative."
          )}
        </p>
      </div>

      <CauseForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default CreateCause;
