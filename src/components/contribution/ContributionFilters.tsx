import React, { useCallback } from 'react';
import { Filter } from 'lucide-react';
import { ContributionFilters as FilterType } from '@/types/contribution';

interface ContributionFiltersProps {
  filters: FilterType;
  onChange: (_filters: FilterType) => void;
  className?: string;
}

export const ContributionFilters: React.FC<ContributionFiltersProps> = ({
  filters,
  onChange,
  className
}) => {
  const handleChange = useCallback((key: keyof FilterType, value: string) => {
    onChange({ ...filters, [key]: value });
  }, [filters, onChange]);

  const handleOrganizationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange('organization', e.target.value);
  }, [handleChange]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange('category', e.target.value);
  }, [handleChange]);

  const handleRegionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange('region', e.target.value);
  }, [handleChange]);

  const handleTimeRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange('timeRange', e.target.value);
  }, [handleChange]);

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md mb-6 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Filter className="h-5 w-5 text-gray-500" aria-hidden="true" />
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="block">
          <span className="sr-only">Organization</span>
          <select
            value={filters.organization}
            onChange={handleOrganizationChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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