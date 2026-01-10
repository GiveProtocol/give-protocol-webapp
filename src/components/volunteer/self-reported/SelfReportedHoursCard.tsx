import React, { useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ValidationStatusBadge } from "./ValidationStatusBadge";
import {
  SelfReportedHoursDisplay,
  ACTIVITY_TYPE_LABELS,
  ValidationStatus,
} from "@/types/selfReportedHours";
import { formatDate } from "@/utils/date";
import { Calendar, MapPin, Building2, Edit2, Trash2, Eye } from "lucide-react";

interface SelfReportedHoursCardProps {
  record: SelfReportedHoursDisplay;
  onView: (_id: string) => void;
  onEdit: (_id: string) => void;
  onDelete: (_id: string) => void;
}

/**
 * Card component displaying a single self-reported hours record
 * @param props - Component props
 * @returns JSX element
 */
export const SelfReportedHoursCard: React.FC<SelfReportedHoursCardProps> = ({
  record,
  onView,
  onEdit,
  onDelete,
}) => {
  const handleView = useCallback(() => {
    onView(record.id);
  }, [onView, record.id]);

  const handleEdit = useCallback(() => {
    onEdit(record.id);
  }, [onEdit, record.id]);

  const handleDelete = useCallback(() => {
    onDelete(record.id);
  }, [onDelete, record.id]);

  const activityTypeLabel =
    ACTIVITY_TYPE_LABELS[record.activityType] || "Unknown";

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header with status and hours */}
          <div className="flex items-center gap-3 mb-2">
            <ValidationStatusBadge
              status={record.validationStatus}
              daysUntilExpiration={record.daysUntilExpiration}
            />
            <span className="text-lg font-semibold text-gray-900">
              {record.hours} {record.hours === 1 ? "hour" : "hours"}
            </span>
          </div>

          {/* Organization */}
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate font-medium">
              {record.organizationDisplayName}
            </span>
            {record.isVerifiedOrganization && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded flex-shrink-0">
                Verified
              </span>
            )}
          </div>

          {/* Activity Type */}
          <p className="text-sm text-gray-600 mb-2">{activityTypeLabel}</p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(record.activityDate, false)}
            </span>
            {record.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {record.location}
              </span>
            )}
          </div>

          {/* Description preview */}
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {record.description}
          </p>

          {/* Rejection reason if rejected */}
          {record.validationStatus === ValidationStatus.REJECTED &&
            record.rejectionNotes && (
              <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-sm text-red-700">
                <span className="font-medium">Rejection reason:</span>{" "}
                {record.rejectionNotes}
              </div>
            )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            icon={<Eye className="h-4 w-4" />}
          >
            View
          </Button>
          {record.canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              icon={<Edit2 className="h-4 w-4" />}
            >
              Edit
            </Button>
          )}
          {record.canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              icon={<Trash2 className="h-4 w-4" />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SelfReportedHoursCard;
