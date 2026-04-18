// Mock for @/components/donor/DonationHistory
// Renders a simple div with donation count for testing.
export const DonationHistory = ({ donations }) => (
  <div data-testid="donation-history">
    <span>{donations.length} donations</span>
  </div>
);
