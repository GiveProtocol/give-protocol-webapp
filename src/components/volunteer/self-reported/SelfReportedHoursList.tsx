import React, { useCallback } from "react";
import { SelfReportedHoursCard } from "./SelfReportedHoursCard";
import {
  SelfReportedHoursDisplay,
  ValidationStatus,
  ACTIVITY_TYPE_LABELS,
  ActivityType,
  SelfReportedHoursFilters,
} from "@/types/selfReportedHours";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ClipboardList } from "lucide-react";

interface SelfReportedHoursListProps {
  records: SelfReportedHoursDisplay[];
  loading: boolean;
  filters: SelfReportedHoursFilters;
  onFilterChange: (_filters: SelfReportedHoursFilters) => void;
  onView: (_id: string) => void;
  onEdit: (_id: string) => void;
  onDelete: (_id: string) => void;
}

/**
 * Component displaying a filterable list of self-reported hours records
 * @param props - Component props
 * @returns JSX element
 */
export const SelfReportedHoursList: React.FC<SelfReportedHoursListProps> = ({
  records,
  loading,
  filters,
  onFilterChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onFilterChange({
        ...filters,
        status: value ? (value as ValidationStatus) : undefined,
      });
    },
    [filters, onFilterChange],
  );

  const handleActivityTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onFilterChange({
        ...filters,
        activityType: value ? (value as ActivityType) : undefined,
      });
    },
    [filters, onFilterChange],
  );

  const handleDateFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({
        ...filters,
        dateFrom: e.target.value || undefined,
      });
    },
    [filters, onFilterChange],
  );

  const handleDateToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({
        ...filters,
        dateTo: e.target.value || undefined,
      });
    },
    [filters, onFilterChange],
  );

  const clearFilters = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = Boolean(
    filters.status ||
    filters.activityType ||
    filters.dateFrom ||
    filters.dateTo,
  );

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Status filter */}
          <div>
            <label
              htmlFor="status-filter"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status || ""}
              onChange={handleStatusChange}
              className="block w-36 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All</option>
              <option value={ValidationStatus.VALIDATED}>Validated</option>
              <option value={ValidationStatus.PENDING}>Pending</option>
              <option value={ValidationStatus.UNVALIDATED}>Unvalidated</option>
              <option value={ValidationStatus.REJECTED}>Rejected</option>
              <option value={ValidationStatus.EXPIRED}>Expired</option>
            </select>
          </div>

          {/* Activity Type filter */}
          <div>
            <label
              htmlFor="activity-filter"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Activity Type
            </label>
            <select
              id="activity-filter"
              value={filters.activityType || ""}
              onChange={handleActivityTypeChange}
              className="block w-44 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label
              htmlFor="date-from"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              From
            </label>
            <input
              id="date-from"
              type="date"
              value={filters.dateFrom || ""}
              onChange={handleDateFromChange}
              className="block border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="date-to"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              To
            </label>
            <input
              id="date-to"
              type="date"
              value={filters.dateTo || ""}
              onChange={handleDateToChange}
              className="block border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {hasActiveFilters
              ? "No matching records"
              : "No volunteer hours logged yet"}
          </h3>
          <p className="text-gray-500">
            {hasActiveFilters
              ? "Try adjusting your filters to find records."
              : "Start by logging your first volunteer hours."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <SelfReportedHoursCard
              key={record.id}
              record={record}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SelfReportedHoursList;
