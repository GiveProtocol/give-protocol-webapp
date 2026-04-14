// Mock for @/hooks/useAdminVolunteerValidation
// Mapped via moduleNameMapper — useAdminVolunteerValidation is a jest.fn() so tests
// can call mockReturnValue to provide per-test validation state.
import { jest } from "@jest/globals";

export const useAdminVolunteerValidation = jest.fn(() => ({
  stats: null,
  statsLoading: false,
  result: {
    requests: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  },
  loading: false,
  overriding: false,
  suspiciousPatterns: [],
  patternsLoading: false,
  fetchStats: jest.fn().mockResolvedValue(null),
  fetchRequests: jest.fn().mockResolvedValue({
    requests: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  }),
  submitOverride: jest.fn().mockResolvedValue(true),
  fetchSuspiciousPatterns: jest.fn().mockResolvedValue([]),
}));
