import React, { useCallback } from "react";

interface RegionFilterProps {
  value: string;
  onChange: (_value: string) => void;
}

/**
 * Component for filtering items by region.
 * @param {string} value - The currently selected region.
 * @param {(value: string) => void} onChange - Callback invoked when the selected region changes.
 * @returns {JSX.Element} A dropdown select element for choosing regions.
 */
export const RegionFilter: React.FC<RegionFilterProps> = ({
  value,
  onChange,
}) => {
  /**
   * Handles the select change event and invokes the onChange callback with the selected value.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event for the select element.
   * @returns {void}
   */
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
