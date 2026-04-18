// Mock for @/components/charity/CharityHeroBanner
// Renders org name in a div with data-testid for assertions.
export const CharityHeroBanner = ({ orgName, bannerImageUrl: _bannerImageUrl }) => (
  <div data-testid="charity-hero-banner">{orgName}</div>
);
