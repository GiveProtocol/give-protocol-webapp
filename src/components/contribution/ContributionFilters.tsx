import React, { useCallback } from "react";
import { Filter } from "lucide-react";
import type {
  ContributionFilters as FilterType,
  ContributionSourceType,
} from "@/types/contribution";

const SOURCE_OPTIONS: { value: ContributionSourceType; label: string }[] = [
  { value: "donation", label: "Donations" },
  { value: "formal_volunteer", label: "Verified Volunteer Hours" },
  { value: "self_reported", label: "Self-Reported Hours" },
];

interface SourceToggleButtonProps {
  source: ContributionSourceType;
  label: string;
  isSelected: boolean;
  onToggle: (_source: ContributionSourceType) => void;
}

function SourceToggleButtonComponent(props: SourceToggleButtonProps) {
  const { source, label, isSelected, onToggle } = props;

  const handleClick = useCallback(() => {
    onToggle(source);
  }, [onToggle, source]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
        isSelected
          ? "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300"
          : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
      aria-pressed={isSelected}
    >
      {label}
    </button>
  );
}

const SourceToggleButton = React.memo(SourceToggleButtonComponent);

interface SourceFilterSectionProps {
  selectedSources: ContributionSourceType[];
  onToggle: (_source: ContributionSourceType) => void;
}

const SourceFilterSection: React.FC<SourceFilterSectionProps> = ({
  selectedSources,
  onToggle,
}) => (
  <div className="mb-4">
    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Contribution Types
    </p>
    <div className="flex flex-wrap gap-2">
      {SOURCE_OPTIONS.map((option) => (
        <SourceToggleButton
          key={option.value}
          source={option.value}
          label={option.label}
          isSelected={selectedSources.includes(option.value)}
          onToggle={onToggle}
        />
      ))}
    </div>
  </div>
);

interface ContributionFiltersProps {
  filters: FilterType;
  onChange: (_filters: FilterType) => void;
  className?: string;
  showSourceFilter?: boolean;
}

export const ContributionFilters: React.FC<ContributionFiltersProps> = ({
  filters,
  onChange,
  className,
  showSourceFilter = true,
}) => {
  const handleChange = useCallback(
    (key: keyof FilterType, value: string) => {
      onChange({ ...filters, [key]: value });
    },
    [filters, onChange],
  );

  const handleOrganizationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleChange("organization", e.target.value);
    },
    [handleChange],
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleChange("category", e.target.value);
    },
    [handleChange],
  );

  const handleRegionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleChange("region", e.target.value);
    },
    [handleChange],
  );

  const handleTimeRangeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleChange("timeRange", e.target.value);
    },
    [handleChange],
  );

  const handleSourceToggle = useCallback(
    (source: ContributionSourceType) => {
      const currentSources = filters.sources || [
        "donation",
        "formal_volunteer",
        "self_reported",
      ];
      const isSelected = currentSources.includes(source);

      let newSources: ContributionSourceType[];
      if (isSelected) {
        // Don't allow deselecting all sources
        if (currentSources.length === 1) return;
        newSources = currentSources.filter((s) => s !== source);
      } else {
        newSources = [...currentSources, source];
      }

      onChange({ ...filters, sources: newSources });
    },
    [filters, onChange],
  );

  const selectedSources = filters.sources || [
    "donation",
    "formal_volunteer",
    "self_reported",
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 ${className || ""}`}
    >
      <div className="flex items-center space-x-4 mb-4">
        <Filter
          className="h-5 w-5 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Filters
        </h2>
      </div>

      {showSourceFilter && (
        <SourceFilterSection
          selectedSources={selectedSources}
          onToggle={handleSourceToggle}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="block">
          <span className="sr-only">Organization</span>
          <select
            value={filters.organization}
            onChange={handleOrganizationChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Select organization"
          >
            <option value="">All Organizations</option>
            <option value="org1">Organization 1</option>
            <option value="org2">Organization 2</option>
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Category</span>
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Select category"
          >
            <option value="">All Categories</option>
            <option value="education">Education</option>
            <option value="environment">Environment</option>
            <option value="health">Health</option>
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Region</span>
          <select
            value={filters.region}
            onChange={handleRegionChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Select region"
          >
            <option value="">All Regions</option>
            <option value="na">North America</option>
            <option value="eu">Europe</option>
            <option value="asia">Asia</option>
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Time Range</span>
          <select
            value={filters.timeRange}
            onChange={handleTimeRangeChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Select time range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </label>
      </div>
    </div>
  );
};
