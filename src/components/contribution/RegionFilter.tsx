import React, { useCallback } from "react";

interface RegionFilterProps {
  value: string;
  onChange: (_value: string) => void;
}

/**
 * RegionFilter component renders a dropdown to filter items by region.
 *
 * @param {Object} props - The component props.
 * @param {string} props.value - The currently selected region value.
 * @param {(value: string) => void} props.onChange - Callback function called when the region value changes.
 * @returns {JSX.Element} The rendered select dropdown for region filtering.
 */
export const RegionFilter: React.FC<RegionFilterProps> = ({
  value,
  onChange,
}) => {
  /**
   * Handles the change event for the region select dropdown.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The select change event.
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
