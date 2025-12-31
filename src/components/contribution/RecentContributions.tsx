import React, { useState, useCallback, useMemo } from "react";
import { DollarSign, Clock, ClipboardCheck } from "lucide-react";
import { formatCurrency } from "@/utils/money";
import { formatDate } from "@/utils/date";
import { useUnifiedContributions } from "@/hooks/useContributionStats";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { ContributionSourceType } from "@/types/contribution";
import type {
  ContributionSource,
  ContributionFilters,
} from "@/services/contributionAggregationService";

const SOURCE_OPTIONS: { value: ContributionSourceType; label: string }[] = [
  { value: "donation", label: "Donations" },
  { value: "formal_volunteer", label: "Verified Hours" },
  { value: "self_reported", label: "Self-Reported" },
];

interface SourceFilterButtonProps {
  source: ContributionSourceType;
  label: string;
  isSelected: boolean;
  onToggle: (source: ContributionSourceType) => void;
}

function SourceFilterButtonComponent(props: SourceFilterButtonProps) {
  const { source, label, isSelected, onToggle } = props;

  const handleClick = useCallback(() => {
    onToggle(source);
  }, [onToggle, source]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
        isSelected
          ? "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300"
          : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
      }`}
      aria-pressed={isSelected}
    >
      {label}
    </button>
  );
}

const SourceFilterButton = React.memo(SourceFilterButtonComponent);

function getContributionIcon(type: ContributionSource) {
  switch (type) {
    case "donation":
      return (
        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
      );
    case "formal_volunteer":
      return (
        <ClipboardCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      );
    case "self_reported":
      return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
  }
}

function getContributionLabel(type: ContributionSource): string {
  switch (type) {
    case "donation":
      return "Donation";
    case "formal_volunteer":
      return "Verified Hours";
    case "self_reported":
      return "Self-Reported";
    default:
      return "Contribution";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
    case "validated":
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          Verified
        </span>
      );
    case "pending":
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          Pending
        </span>
      );
    case "unvalidated":
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          Unvalidated
        </span>
      );
    default:
      return null;
  }
}

export const RecentContributions: React.FC = () => {
  const [selectedSources, setSelectedSources] = useState<
    ContributionSourceType[]
  >(["donation", "formal_volunteer", "self_reported"]);

  const filters: ContributionFilters = useMemo(
    () => ({
      sources: selectedSources as ContributionSource[],
    }),
    [selectedSources],
  );

  const {
    data: contributions,
    isLoading,
    error,
  } = useUnifiedContributions(filters);

  const handleSourceToggle = useCallback((source: ContributionSourceType) => {
    setSelectedSources((current) => {
      const isSelected = current.includes(source);
      if (isSelected) {
        // Don't allow deselecting all sources
        if (current.length === 1) return current;
        return current.filter((s) => s !== source);
      }
      return [...current, source];
    });
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Contributions
        </h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Contributions
        </h2>
        <p className="text-red-600 dark:text-red-400">
          Failed to load contributions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Recent Contributions
        </h2>
        <div className="flex flex-wrap gap-1">
          {SOURCE_OPTIONS.map((option) => (
            <SourceFilterButton
              key={option.value}
              source={option.value}
              label={option.label}
              isSelected={selectedSources.includes(option.value)}
              onToggle={handleSourceToggle}
            />
          ))}
        </div>
      </div>

      {contributions && contributions.length > 0 ? (
        <div className="space-y-3">
          {contributions.slice(0, 10).map((contribution) => (
            <div
              key={contribution.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white dark:bg-gray-600 rounded-full">
                  {getContributionIcon(contribution.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {contribution.organizationName}
                    </p>
                    {getStatusBadge(contribution.status)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getContributionLabel(contribution.type)} &bull;{" "}
                    {formatDate(contribution.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {contribution.amount !== undefined ? (
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(contribution.amount)}
                  </span>
                ) : contribution.hours !== undefined ? (
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {contribution.hours.toLocaleString()} hrs
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No contributions found
          </p>
        </div>
      )}
    </div>
  );
};
