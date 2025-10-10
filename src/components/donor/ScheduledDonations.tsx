import React, { useState, useEffect, useCallback } from "react";
import { useScheduledDonation } from "@/hooks/web3/useScheduledDonation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Calendar, AlertTriangle } from "lucide-react";
import { formatDate } from "@/utils/date";
import { useToast } from "@/contexts/ToastContext";
import { Logger } from "@/utils/logger";

interface ScheduledDonation {
  id: number;
  charity: string;
  charityName?: string;
  token: string;
  tokenSymbol?: string;
  totalAmount: string;
  amountPerMonth: string;
  monthsRemaining: number;
  nextDistribution: Date;
  active: boolean;
}

export const ScheduledDonations: React.FC = () => {
  const { getDonorSchedules, cancelSchedule, loading, error } =
    useScheduledDonation();
  const [schedules, setSchedules] = useState<ScheduledDonation[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduledDonation | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchSchedules = useCallback(async () => {
    try {
      setLoadingSchedules(true);
      const donorSchedules = await getDonorSchedules();
      setSchedules(donorSchedules);
    } catch (err) {
      Logger.error("Failed to fetch scheduled donations:", err);
    } finally {
      setLoadingSchedules(false);
    }
  }, [getDonorSchedules]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleCancelClick = useCallback((schedule: ScheduledDonation) => {
    setSelectedSchedule(schedule);
    setCancelError(null);
    setIsCancelModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCancelModalOpen(false);
  }, []);

  const createCancelHandler = useCallback(
    (schedule: ScheduledDonation) => {
      return () => handleCancelClick(schedule);
    },
    [handleCancelClick],
  );

  const handleConfirmCancel = useCallback(async () => {
    if (!selectedSchedule) return;

    try {
      setCancelError(null);
      await cancelSchedule(selectedSchedule.id);
      showToast(
        "success",
        "Scheduled donation cancelled",
        "Your monthly donation schedule has been cancelled and remaining funds returned to your wallet.",
      );
      setIsCancelModalOpen(false);
      fetchSchedules();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to cancel scheduled donation";
      setCancelError(errorMessage);

      // Check if user rejected transaction
      if (
        errorMessage.includes("user rejected") ||
        errorMessage.includes("User denied")
      ) {
        setCancelError(
          "Transaction was rejected. Please confirm the transaction in your wallet to cancel the schedule.",
        );
      }
    }
  }, [selectedSchedule, cancelSchedule, showToast, fetchSchedules]);

  if (loadingSchedules) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Scheduled Donations
          </h3>
          <p className="text-gray-500 mb-4">
            You don&apos;t have any active monthly donation schedules.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card className="mb-6">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Monthly Donation Schedules</h2>
          <Button variant="secondary" onClick={fetchSchedules} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        <div className="divide-y divide-gray-200">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  {/* Charity Name and Icon */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg"><Calendar className="h-5 w-5 text-indigo-600" /></div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {schedule.charityName || `Charity ${schedule.charity.substring(0, 6)}...${schedule.charity.substring(38)}`}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">{schedule.charity}</p>
                    </div>
                  </div>

                  {/* Schedule Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Commitment */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Total Commitment
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {schedule.totalAmount} {schedule.tokenSymbol || 'tokens'}
                      </p>
                    </div>

                    {/* Monthly Amount */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Monthly Payment
                      </p>
                      <p className="text-base font-semibold text-green-700">
                        {schedule.amountPerMonth} {schedule.tokenSymbol || 'tokens'}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Progress
                      </p>
                      <p className="text-base font-semibold text-blue-700">
                        {12 - schedule.monthsRemaining} of 12 months
                      </p>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${((12 - schedule.monthsRemaining) / 12) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Next Payment */}
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Next Payment
                      </p>
                      <p className="text-base font-semibold text-amber-700">
                        {formatDate(schedule.nextDistribution.toISOString())}
                      </p>
                    </div>
                  </div>

                  {/* Token Address */}
                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-xs text-gray-500">
                      Token Contract: 
                    </p>
                    <p className="text-xs text-gray-600 font-mono">
                      {schedule.token.substring(0, 6)}...{schedule.token.substring(38)}
                    </p>
                  </div>
                </div>

                {/* Cancel Button */}
                <div className="flex items-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={createCancelHandler(schedule)}
                    disabled={loading}
                    className="whitespace-nowrap"
                  >
                    Cancel Schedule
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="bg-red-100 rounded-full p-3 mx-auto w-fit"><AlertTriangle className="h-6 w-6 text-red-600" /></div>
            
            <h3 className="text-lg font-medium text-gray-900">
              Confirm Cancellation
            </h3>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel your monthly donation schedule to:
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">
                  {selectedSchedule.charityName || `Charity ${selectedSchedule.charity.substring(0, 6)}...`}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedSchedule.monthsRemaining} payments remaining
                </p>
              </div>
              <p className="text-sm text-gray-600">
                The remaining funds will be returned to your wallet:
              </p>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-blue-700">
                  {(parseFloat(selectedSchedule.amountPerMonth) * selectedSchedule.monthsRemaining).toFixed(2)} {selectedSchedule.tokenSymbol || 'tokens'}
                </p>
              </div>
            </div>

            {cancelError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md">
                {cancelError}
              </div>
            )}

            <div className="flex justify-center space-x-3">
              <Button variant="secondary" onClick={handleCloseModal}>
                Keep Schedule
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                disabled={loading}
              >
                {loading ? "Processing..." : "Cancel Schedule"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
