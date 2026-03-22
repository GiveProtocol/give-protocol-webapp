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
  onToggle: (_source: ContributionSourceType) => void;
}

/**
 * Renders a button for toggling a source filter.
 *
 * @param props - The properties for SourceFilterButtonComponent.
 * @param props.source - The source identifier.
 * @param props.label - The label displayed on the button.
 * @param props.isSelected - Whether the source is currently selected.
 * @param props.onToggle - Callback invoked when the button is clicked, receiving the source.
 * @returns {JSX.Element} The rendered button element.
 */
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
          ? "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 text-emerald-700 dark:text-emerald-300"
          : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
      }`}
      aria-pressed={isSelected}
    >
      {label}
    </button>
  );
}

const SourceFilterButton = React.memo(SourceFilterButtonComponent);

/**
 * Returns the icon element for a given contribution source type.
 *
 * @param type - The contribution source type.
 * @returns A JSX icon element representing the contribution type.
 */
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

/**
 * Returns a descriptive label for a contribution source.
 *
 * @param type - The source type of the contribution.
 * @returns A string label representing the contribution type.
 */
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

/**
 * Returns a JSX badge element corresponding to the given contribution status.
 *
 * @param status - The status string ('completed', 'validated', 'pending', 'unvalidated') used to determine badge label and styling.
 * @returns A JSX element representing the status badge, or null if the status is unrecognized.
 */
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

/** Single contribution row with icon, organization name, status badge, and amount. */
const ContributionRow: React.FC<{ contribution: { id: string; type: ContributionSource; organizationName: string; status: string; date: string; amount?: number; hours?: number } }> = ({ contribution }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
      {contribution.amount !== undefined && (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {formatCurrency(contribution.amount)}
        </span>
      )}
      {contribution.amount === undefined && contribution.hours !== undefined && (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {contribution.hours.toLocaleString()} hrs
        </span>
      )}
    </div>
  </div>
);

/**
 * RecentContributions component displays recent contributions and allows filtering by source.
 *
 * @returns A React component rendering the recent contributions UI.
 */
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

      {contributions?.length > 0 ? (
        <div className="space-y-3">
          {contributions.slice(0, 10).map((contribution) => (
            <ContributionRow key={contribution.id} contribution={contribution} />
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
