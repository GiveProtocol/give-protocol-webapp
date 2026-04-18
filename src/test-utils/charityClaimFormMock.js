// Mock for @/components/auth/CharityClaimForm
// Renders a simple placeholder with back button for testing.
export const CharityClaimForm = ({ organization, onBack }) => (
  <div data-testid="charity-claim-form">
    <span>Claim Form for {organization?.name}</span>
    <button type="button" onClick={onBack}>
      Back to search
    </button>
  </div>
);
