// Mock for @/hooks/useAdminDonations
// Mapped via moduleNameMapper — useAdminDonations is a jest.fn() so
// tests can call mockReturnValue to supply per-test return values.
import { jest } from "@jest/globals";

export const useAdminDonations = jest.fn(() => ({
  result: { donations: [], totalCount: 0, page: 1, limit: 50, totalPages: 0 },
  loading: false,
  flagging: false,
  summary: [],
  summaryLoading: false,
  fetchDonations: jest.fn(),
  fetchSummary: jest.fn(),
  submitFlag: jest.fn(),
  submitResolveFlag: jest.fn(),
  exportCsv: jest.fn(),
}));
