// Mock for @/components/charity/CharityOrganizationCard
// Avoids react-router-dom Link dependency in tests.
import React from "react";

export const CharityOrganizationCard = ({ organization }) => (
  <div data-testid="charity-card">{organization.name}</div>
);
