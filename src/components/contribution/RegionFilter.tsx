import React, { useCallback } from "react";

interface RegionFilterProps {
  value: string;
  onChange: (_value: string) => void;
}

export const RegionFilter: React.FC<RegionFilterProps> = ({
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
      aria-label="Filter by region"
    >
      <option value="all">All Regions</option>
      <option value="na">North America</option>
      <option value="eu">Europe</option>
      <option value="asia">Asia</option>
      <option value="africa">Africa</option>
      <option value="sa">South America</option>
      <option value="oceania">Oceania</option>
    </select>
  );
};
