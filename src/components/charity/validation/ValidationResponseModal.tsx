import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { RejectionReasonSelect } from "./RejectionReasonSelect";
import {
  RejectionReason,
  ValidationQueueItem,
  ACTIVITY_TYPE_LABELS,
} from "@/types/selfReportedHours";
import { formatDate } from "@/utils/date";
import {
  X,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
} from "lucide-react";

interface ValidationResponseModalProps {
  item: ValidationQueueItem;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (_requestId: string) => Promise<boolean>;
  onReject: (
    _requestId: string,
    _reason: RejectionReason,
    _notes?: string,
  ) => Promise<boolean>;
}

/**
 * Modal for approving or rejecting validation requests
 * @param props - Component props
 * @returns JSX element
 */
export const ValidationResponseModal: React.FC<
  ValidationResponseModalProps
> = ({ item, isOpen, onClose, onApprove, onReject }) => {
  const [mode, setMode] = useState<"view" | "reject">("view");
  const [rejectionReason, setRejectionReason] = useState<RejectionReason | "">(
    "",
  );
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleApprove = useCallback(async () => {
    try {
      setProcessing(true);
      const success = await onApprove(item.id);
      if (success) {
        onClose();
      }
    } finally {
      setProcessing(false);
    }
  }, [item.id, onApprove, onClose]);

  const handleStartReject = useCallback(() => {
    setMode("reject");
    setError("");
  }, []);

  const handleCancelReject = useCallback(() => {
    setMode("view");
    setRejectionReason("");
    setRejectionNotes("");
    setError("");
  }, []);

  const handleConfirmReject = useCallback(async () => {
    if (!rejectionReason) {
      setError("Please select a rejection reason");
      return;
    }

    try {
      setProcessing(true);
      const success = await onReject(
        item.id,
        rejectionReason,
        rejectionNotes || undefined,
      );
      if (success) {
        onClose();
      }
    } finally {
      setProcessing(false);
    }
  }, [item.id, rejectionReason, rejectionNotes, onReject, onClose]);

  const handleReasonChange = useCallback((reason: RejectionReason | "") => {
    setRejectionReason(reason);
    if (reason) setError("");
  }, []);

  const handleNotesChange = useCallback((notes: string) => {
    setRejectionNotes(notes);
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  const activityTypeLabel =
    ACTIVITY_TYPE_LABELS[item.activityType] || "Unknown";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="validation-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2
            id="validation-modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            {mode === "reject"
              ? "Reject Validation Request"
              : "Review Validation Request"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === "view" ? (
            <>
              {/* Volunteer Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Volunteer
                </h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.volunteerName}
                    </p>
                    {item.volunteerEmail && (
                      <p className="text-sm text-gray-500">
                        {item.volunteerEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Activity Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(item.activityDate, false)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Hours</p>
                      <p className="font-medium text-gray-900">
                        {item.hours} {item.hours === 1 ? "hour" : "hours"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Activity Type</p>
                      <p className="font-medium text-gray-900">
                        {activityTypeLabel}
                      </p>
                    </div>
                  </div>
                  {item.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">
                          {item.location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
                  {item.description}
                </p>
              </div>

              {/* Request Info */}
              <div className="text-sm text-gray-500 mb-6">
                <p>
                  Submitted: {formatDate(item.createdAt, true)}
                  {item.daysRemaining !== undefined && (
                    <span className="ml-2 text-amber-600">
                      ({item.daysRemaining} days remaining to validate)
                    </span>
                  )}
                </p>
                {item.isResubmission && (
                  <p className="mt-1 text-amber-600 font-medium">
                    This is an appeal/resubmission of a previously rejected
                    request
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Rejection Form */
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Please select a reason for rejecting this validation request.
                The volunteer will be notified.
              </p>
              <RejectionReasonSelect
                value={rejectionReason}
                notes={rejectionNotes}
                onReasonChange={handleReasonChange}
                onNotesChange={handleNotesChange}
                error={error}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {mode === "view" ? (
            <>
              <Button
                variant="secondary"
                onClick={handleStartReject}
                disabled={processing}
                icon={<XCircle className="h-4 w-4" />}
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processing}
                icon={<CheckCircle className="h-4 w-4" />}
              >
                {processing ? "Processing..." : "Approve"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleCancelReject}
                disabled={processing}
              >
                Back
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmReject}
                disabled={processing || !rejectionReason}
              >
                {processing ? "Processing..." : "Confirm Rejection"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationResponseModal;
