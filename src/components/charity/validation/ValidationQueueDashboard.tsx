import React, { useState, useCallback } from 'react';
import { useValidationQueue } from '@/hooks/useValidationQueue';
import { ValidationQueueList } from './ValidationQueueList';
import { ValidationResponseModal } from './ValidationResponseModal';
import { ValidationQueueItem, RejectionReason } from '@/types/selfReportedHours';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ClipboardCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ValidationQueueDashboardProps {
  organizationId: string;
}

/**
 * Main dashboard for managing validation requests
 * @param props - Component props
 * @returns JSX element
 */
export const ValidationQueueDashboard: React.FC<ValidationQueueDashboardProps> = ({
  organizationId,
}) => {
  const {
    queue,
    queueCount,
    loading,
    error,
    approveRequest,
    rejectRequest,
    batchApprove,
    batchReject,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    refetch,
  } = useValidationQueue(organizationId);

  const [selectedItem, setSelectedItem] = useState<ValidationQueueItem | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);

  const handleView = useCallback((item: ValidationQueueItem) => {
    setSelectedItem(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleQuickApprove = useCallback(async (id: string) => {
    await approveRequest(id);
  }, [approveRequest]);

  const handleQuickReject = useCallback((id: string) => {
    // Find the item and open the modal for rejection
    const item = queue.find(q => q.id === id);
    if (item) {
      setSelectedItem(item);
    }
  }, [queue]);

  const handleApproveFromModal = useCallback(async (requestId: string): Promise<boolean> => {
    return await approveRequest(requestId);
  }, [approveRequest]);

  const handleRejectFromModal = useCallback(async (
    requestId: string,
    reason: RejectionReason,
    notes?: string
  ): Promise<boolean> => {
    return await rejectRequest(requestId, reason, notes);
  }, [rejectRequest]);

  const handleBatchApprove = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setBatchProcessing(true);
    try {
      await batchApprove(Array.from(selectedIds));
    } finally {
      setBatchProcessing(false);
    }
  }, [selectedIds, batchApprove]);

  const handleBatchReject = useCallback(async () => {
    if (selectedIds.size === 0) return;
    // For batch rejection, we'll use a simple reason
    setBatchProcessing(true);
    try {
      await batchReject(Array.from(selectedIds), RejectionReason.OTHER, 'Batch rejected by organization');
    } finally {
      setBatchProcessing(false);
    }
  }, [selectedIds, batchReject]);

  const handleSelect = useCallback((id: string, _selected: boolean) => {
    toggleSelection(id);
  }, [toggleSelection]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading && queue.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-indigo-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Validation Queue</h2>
            <p className="text-sm text-gray-500">
              Review and validate volunteer hour submissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {queueCount > 0 && (
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
              {queueCount} pending
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <ValidationQueueList
          items={queue}
          loading={loading}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onView={handleView}
          onQuickApprove={handleQuickApprove}
          onQuickReject={handleQuickReject}
          onBatchApprove={handleBatchApprove}
          onBatchReject={handleBatchReject}
          batchProcessing={batchProcessing}
        />
      </div>

      {/* View/Respond Modal */}
      {selectedItem && (
        <ValidationResponseModal
          item={selectedItem}
          isOpen={Boolean(selectedItem)}
          onClose={handleCloseModal}
          onApprove={handleApproveFromModal}
          onReject={handleRejectFromModal}
        />
      )}
    </div>
  );
};

export default ValidationQueueDashboard;
