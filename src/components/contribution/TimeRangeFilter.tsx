import React, { useCallback } from "react";

interface TimeRangeFilterProps {
  value: string;
  onChange: (_value: string) => void;
}

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
      className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
      aria-label="Filter by time range"
    >
      <option value="all">All Time</option>
      <option value="year">This Year</option>
      <option value="month">This Month</option>
      <option value="week">This Week</option>
    </select>
  );
};
