// Mock for @/hooks/useAdminDonations
// Mapped via moduleNameMapper — useAdminDonations is a jest.fn() so tests
// can call mockReturnValue to provide per-test donation list state.
import { jest } from "@jest/globals";

export const useAdminDonations = jest.fn(() => ({
  result: {
    donations: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  },
  loading: false,
  flagging: false,
  summary: [],
  summaryLoading: false,
  fetchDonations: jest.fn().mockResolvedValue({
    donations: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  }),
  fetchSummary: jest.fn().mockResolvedValue([]),
  submitFlag: jest.fn().mockResolvedValue(true),
  submitResolveFlag: jest.fn().mockResolvedValue(true),
  exportCsv: jest.fn(),
}));
