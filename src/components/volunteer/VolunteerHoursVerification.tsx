import React, { useState, useCallback } from "react";
import { CheckCircle, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useVolunteerVerification } from "@/hooks/useVolunteerVerification";
import { formatDate } from "@/utils/date";
import { useTranslation } from "@/hooks/useTranslation";
import { Logger } from "@/utils/logger";

interface VolunteerHoursVerificationProps {
  hoursId: string;
  volunteerId: string;
  volunteerName: string;
  hours: number;
  datePerformed: string;
  description?: string;
  onVerified?: (_hash: string) => void;
}

/**
 * Component for verifying volunteer hours.
 * @param {VolunteerHoursVerificationProps} props - Props for the component.
 * @param {string} props.hoursId - The ID of the hours record to verify.
 * @param {string} props.volunteerId - The ID of the volunteer.
 * @param {string} props.volunteerName - The name of the volunteer.
 * @param {number} props.hours - The number of hours performed.
 * @param {string} props.datePerformed - The date when the hours were performed.
 * @param {string} [props.description] - Description of the volunteer activity.
 * @param {(hash: string) => void} [props.onVerified] - Callback invoked with the verification hash when verified.
 * @returns {JSX.Element} The volunteer hours verification component.
 */
export const VolunteerHoursVerification: React.FC<
  VolunteerHoursVerificationProps
> = ({
  hoursId,
  volunteerId: _volunteerId,
  volunteerName,
  hours,
  datePerformed,
  description,
  onVerified,
}) => {
  const { verifyHours, loading, error } = useVolunteerVerification();
  const [verificationHash, setVerificationHash] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const { t } = useTranslation();

  /**
   * Handles the verification of volunteer hours.
   * @returns {Promise<void>} Promise that resolves when verification is complete.
   */
  const handleVerify = useCallback(async () => {
    try {
      const hash = await verifyHours(hoursId);
      if (hash) {
        setVerificationHash(hash);
        setIsVerified(true);
        onVerified?.(hash);
      }
    } catch (err) {
      Logger.error("Verification failed:", err);
    }
  }, [verifyHours, hoursId, onVerified]);

  const handleReject = useCallback(() => {
    // Rejection logic placeholder
    // Full implementation pending rejection workflow
  }, []);

  if (isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <h3 className="text-lg font-medium text-green-800">
            {t("volunteer.verificationComplete", "Verification Complete")}
          </h3>
        </div>
        <p className="text-sm text-green-700 mb-3">
          {t(
            "volunteer.hoursVerified",
            "The volunteer hours have been verified and recorded on the blockchain.",
          )}
        </p>
        {verificationHash && (
          <div className="bg-white p-3 rounded border border-green-200">
            <p className="text-xs text-gray-500 mb-1">
              {t("volunteer.verificationHash", "Verification Hash")}
            </p>
            <div className="flex items-center">
              <code className="text-xs font-mono text-gray-800 break-all">
                {verificationHash}
              </code>
              <a
                href={`https://moonbase.moonscan.io/tx/${verificationHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-emerald-600 hover:text-emerald-800"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{volunteerName}</h3>
          <p className="text-sm text-gray-500">
            {hours} {t("volunteer.hours")} {formatDate(datePerformed)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleVerify}
            disabled={loading}
            className="flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {loading
              ? t("volunteer.verifying", "Verifying...")
              : t("volunteer.verify")}
          </Button>
          <Button
            variant="secondary"
            onClick={handleReject}
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            {t("volunteer.reject")}
          </Button>
        </div>
      </div>

      {description && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">
            {t("volunteer.description")}
          </p>
          <p className="text-sm text-gray-700">{description}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};
