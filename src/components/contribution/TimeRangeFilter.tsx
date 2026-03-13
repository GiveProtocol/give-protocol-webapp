import React, { useCallback } from "react";

interface TimeRangeFilterProps {
  value: string;
  onChange: (_value: string) => void;
}

/**
 * A React component that renders a select dropdown for filtering by time range.
 *
 * @param {string} value - The currently selected time range.
 * @param {(value: string) => void} onChange - Callback function invoked when the selection changes.
 * @returns {JSX.Element} The rendered select element for time range filtering.
 */
export const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  value,
  onChange,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <select
      value={value}
      onChange={handleChange}
      className="px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
      aria-label="Filter by time range"
    >
      <option value="all">All Time</option>
      <option value="year">This Year</option>
      <option value="month">This Month</option>
      <option value="week">This Week</option>
    </select>
  );
};
