// Mock for @/hooks/useAdminCharities
// Mapped via moduleNameMapper — useAdminCharities is a jest.fn() so
// tests can call mockReturnValue to supply per-test return values.
import { jest } from "@jest/globals";

export const useAdminCharities = jest.fn(() => ({
  result: { charities: [], totalCount: 0, page: 1, limit: 50, totalPages: 0 },
  loading: false,
  updating: false,
  fetchCharities: jest.fn(),
  approveCharity: jest.fn(),
  rejectCharity: jest.fn(),
  suspendCharity: jest.fn(),
  reinstateCharity: jest.fn(),
}));
