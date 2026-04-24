import React, { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { ValidationStatusBadge } from "./ValidationStatusBadge";
import {
  ValidationQueueItem as QueueItemType,
  ACTIVITY_TYPE_LABELS,
} from "@/types/selfReportedHours";
import { formatDate } from "@/utils/date";
import { User, Calendar, Clock, Eye, CheckCircle, XCircle } from "lucide-react";

interface ValidationQueueItemProps {
  item: QueueItemType;
  isSelected: boolean;
  onSelect: (_id: string, _selected: boolean) => void;
  onView: (_item: QueueItemType) => void;
  onQuickApprove: (_id: string) => void;
  onQuickReject: (_id: string) => void;
}

/** Volunteer name, activity summary, description, and metadata for a queue item. */
const QueueItemDetails: React.FC<{
  item: QueueItemType;
  activityTypeLabel: string;
}> = ({ item, activityTypeLabel }) => (
  <div className="flex-1">
    <div className="flex items-center gap-2 mb-1">
      <User className="h-4 w-4 text-gray-400" />
      <span className="font-medium text-gray-900 truncate">
        {item.volunteerName}
      </span>
      {item.isResubmission && (
        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
          Appeal
        </span>
      )}
    </div>
    <p className="text-sm text-gray-600 mb-2">
      <span className="font-medium">
        {item.hours} {item.hours === 1 ? "hour" : "hours"}
      </span>
      {" · "}
      {activityTypeLabel}
    </p>
    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
      {item.description}
    </p>
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {formatDate(item.activityDate, false)}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        Submitted {formatDate(item.createdAt, false)}
      </span>
      {item.daysRemaining !== undefined && (
        <ValidationStatusBadge
          status="pending"
          daysRemaining={item.daysRemaining}
        />
      )}
    </div>
  </div>
);

/** View, approve, and reject action buttons for a queue item. */
const QueueItemActions: React.FC<{
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
}> = ({ onView, onApprove, onReject }) => (
  <div className="flex flex-col gap-2 flex-shrink-0">
    <Button
      variant="ghost"
      size="sm"
      onClick={onView}
      icon={<Eye className="h-4 w-4" />}
    >
      View
    </Button>
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onApprove}
        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        icon={<CheckCircle className="h-4 w-4" />}
        title="Quick approve"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={onReject}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        icon={<XCircle className="h-4 w-4" />}
        title="Reject"
      />
    </div>
  </div>
);

/**
 * Individual item in the validation queue list
 * @param props - Component props
 * @returns JSX element
 */
export const ValidationQueueItemComponent: React.FC<
  ValidationQueueItemProps
> = ({ item, isSelected, onSelect, onView, onQuickApprove, onQuickReject }) => {
  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSelect(item.id, e.target.checked);
    },
    [item.id, onSelect],
  );

  const handleView = useCallback(() => {
    onView(item);
  }, [item, onView]);

  const handleApprove = useCallback(() => {
    onQuickApprove(item.id);
  }, [item.id, onQuickApprove]);

  const handleReject = useCallback(() => {
    onQuickReject(item.id);
  }, [item.id, onQuickReject]);

  const activityTypeLabel =
    ACTIVITY_TYPE_LABELS[item.activityType] || "Unknown";

  return (
    <div
      className={`p-4 border rounded-lg transition-colors ${
        isSelected
          ? "border-emerald-300 bg-emerald-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start gap-4">
        <label className="pt-1" aria-label="Select item">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
        </label>

        <QueueItemDetails item={item} activityTypeLabel={activityTypeLabel} />
        <QueueItemActions
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  );
};

export default ValidationQueueItemComponent;
