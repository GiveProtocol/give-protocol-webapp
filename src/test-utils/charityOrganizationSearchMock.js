// Mock for @/components/auth/CharityOrganizationSearch
// Renders a simple placeholder with callbacks for testing.
export const CharityOrganizationSearch = ({ onOrganizationSelect: _onSelect, onSkip }) => (
  <div data-testid="charity-organization-search">
    <span>Charity Organization Search</span>
    <button type="button" onClick={onSkip}>
      Skip search
    </button>
  </div>
);
