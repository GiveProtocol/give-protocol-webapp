// Mock for @/hooks/useCharityOrganizationSearch
// Mapped via moduleNameMapper — useCharityOrganizationSearch is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const useCharityOrganizationSearch = jest.fn(() => ({
  organizations: [],
  loading: false,
  hasMore: false,
  error: null,
  loadMore: jest.fn(),
}));
