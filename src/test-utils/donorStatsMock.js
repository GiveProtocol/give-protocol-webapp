// Mock for @/components/donor/DonorStats
// Renders a simple div with stat values for testing.
export const DonorStats = ({ totalDonated, impactGrowth, charitiesSupported }) => (
  <div data-testid="donor-stats">
    <span>Total: {totalDonated}</span>
    <span>Impact: {impactGrowth}</span>
    <span>Charities: {charitiesSupported}</span>
  </div>
);
