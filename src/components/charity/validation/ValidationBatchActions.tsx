import React, { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ValidationBatchActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchApprove: () => void;
  onBatchReject: () => void;
  disabled?: boolean;
}

/**
 * Batch action controls for validation queue
 * @param props - Component props
 * @returns JSX element
 */
export const ValidationBatchActions: React.FC<ValidationBatchActionsProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBatchApprove,
  onBatchReject,
  disabled = false,
}) => {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  }, [allSelected, onSelectAll, onClearSelection]);

  if (totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            disabled={disabled}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            {allSelected ? 'Deselect all' : 'Select all'}
          </span>
        </label>
        {selectedCount > 0 && (
          <span className="text-sm text-gray-500">
            {selectedCount} of {totalCount} selected
          </span>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClearSelection}
            disabled={disabled}
            icon={<X className="h-4 w-4" />}
          >
            Clear
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onBatchReject}
            disabled={disabled}
            icon={<XCircle className="h-4 w-4" />}
            className="text-red-600 hover:text-red-700"
          >
            Reject ({selectedCount})
          </Button>
          <Button
            size="sm"
            onClick={onBatchApprove}
            disabled={disabled}
            icon={<CheckCircle className="h-4 w-4" />}
          >
            Approve ({selectedCount})
          </Button>
        </div>
      )}
    </div>
  );
};

export default ValidationBatchActions;
