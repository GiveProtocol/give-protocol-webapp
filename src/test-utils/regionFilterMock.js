// Mock for contribution/RegionFilter component
export const RegionFilter = ({ value, onChange }) => (
  <select data-testid="region-filter" value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="all">All Regions</option>
  </select>
);
