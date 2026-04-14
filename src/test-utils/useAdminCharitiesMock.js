// Mock for @/hooks/useAdminCharities
// Mapped via moduleNameMapper — useAdminCharities is a jest.fn() so tests
// can call mockReturnValue to provide per-test charity list state.
import { jest } from "@jest/globals";

export const useAdminCharities = jest.fn(() => ({
  result: {
    charities: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  },
  loading: false,
  updating: false,
  fetchCharities: jest.fn().mockResolvedValue({
    charities: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  }),
  approveCharity: jest.fn().mockResolvedValue(true),
  rejectCharity: jest.fn().mockResolvedValue(true),
  suspendCharity: jest.fn().mockResolvedValue(true),
  reinstateCharity: jest.fn().mockResolvedValue(true),
}));
