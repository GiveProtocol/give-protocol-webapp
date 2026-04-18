// Mock for SelfReportedHoursStats component
export const SelfReportedHoursStats = ({ stats }) => (
  <div data-testid="self-reported-hours-stats">
    Stats: {stats.recordCount} records, {stats.totalValidatedHours} validated hours
  </div>
);
