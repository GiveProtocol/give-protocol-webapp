// Mock for @/services/charityOrganizationService
// Mapped via moduleNameMapper (alias-only) — service tests using relative imports
// still get the real implementation.
import { jest } from "@jest/globals";

export const searchCharityOrganizations = jest.fn().mockResolvedValue({
  organizations: [],
  hasMore: false,
});

export const getFeaturedCharities = jest.fn().mockResolvedValue([]);
