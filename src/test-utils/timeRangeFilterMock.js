// Mock for contribution/TimeRangeFilter component
export const TimeRangeFilter = ({ value, onChange }) => (
  <select data-testid="time-range-filter" value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="all">All Time</option>
  </select>
);
