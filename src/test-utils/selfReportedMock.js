// Mock for @/components/volunteer/self-reported
// Used in GiveDashboard tests as a stub for the volunteer hours sub-panel.
export const SelfReportedHoursDashboard = ({ onToggle }) => (
  <div data-testid="volunteer-hours">
    <button onClick={onToggle}>Toggle Hours</button>
  </div>
);
