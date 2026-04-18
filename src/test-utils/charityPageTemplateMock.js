// Mock for @/components/charity/CharityPageTemplate
// Renders charity name and key data for assertion in tests.
export const CharityPageTemplate = ({ charity }) => (
  <div data-testid="charity-page-template">
    <h1>{charity.name}</h1>
    <p>{charity.description}</p>
    <span>{charity.category}</span>
  </div>
);

export const CharityProfileData = undefined;
