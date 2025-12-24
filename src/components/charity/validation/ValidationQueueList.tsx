import React from "react";
import { ValidationQueueItemComponent } from "./ValidationQueueItem";
import { ValidationBatchActions } from "./ValidationBatchActions";
import { ValidationQueueItem } from "@/types/selfReportedHours";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ClipboardList } from "lucide-react";

interface ValidationQueueListProps {
  items: ValidationQueueItem[];
  loading: boolean;
  selectedIds: Set<string>;
  onSelect: (_id: string, _selected: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onView: (_item: ValidationQueueItem) => void;
  onQuickApprove: (_id: string) => void;
  onQuickReject: (_id: string) => void;
  onBatchApprove: () => void;
  onBatchReject: () => void;
  batchProcessing: boolean;
}

/**
 * List component for validation queue items with batch actions
 * @param props - Component props
 * @returns JSX element
 */
export const ValidationQueueList: React.FC<ValidationQueueListProps> = ({
  items,
  loading,
  selectedIds,
  onSelect,
  onSelectAll,
  onClearSelection,
  onView,
  onQuickApprove,
  onQuickReject,
  onBatchApprove,
  onBatchReject,
  batchProcessing,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No pending validation requests
        </h3>
        <p className="text-gray-500">
          When volunteers submit hours for your organization, they will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ValidationBatchActions
        selectedCount={selectedIds.size}
        totalCount={items.length}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
        onBatchApprove={onBatchApprove}
        onBatchReject={onBatchReject}
        disabled={batchProcessing}
      />

      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <ValidationQueueItemComponent
            key={item.id}
            item={item}
            isSelected={selectedIds.has(item.id)}
            onSelect={onSelect}
            onView={onView}
            onQuickApprove={onQuickApprove}
            onQuickReject={onQuickReject}
          />
        ))}
      </div>
    </div>
  );
};

export default ValidationQueueList;
