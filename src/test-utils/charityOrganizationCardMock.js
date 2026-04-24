// Mock for @/components/charity/CharityOrganizationCard
// Avoids react-router-dom Link dependency in tests.

/** Mock CharityOrganizationCard that renders a simple div with the org name. */
export const CharityOrganizationCard = ({ organization }) => (
  <div data-testid="charity-card">{organization.name}</div>
);
