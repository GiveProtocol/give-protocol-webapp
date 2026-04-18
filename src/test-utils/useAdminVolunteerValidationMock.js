// Mock for @/hooks/useAdminVolunteerValidation
// Mapped via moduleNameMapper — useAdminVolunteerValidation is a jest.fn() so
// tests can call mockReturnValue to supply per-test return values.
import { jest } from "@jest/globals";

export const useAdminVolunteerValidation = jest.fn(() => ({
  stats: null,
  statsLoading: false,
  result: { requests: [], totalCount: 0, page: 1, limit: 50, totalPages: 0 },
  loading: false,
  overriding: false,
  suspiciousPatterns: [],
  patternsLoading: false,
  fetchStats: jest.fn(),
  fetchRequests: jest.fn(),
  submitOverride: jest.fn(),
  fetchSuspiciousPatterns: jest.fn(),
}));
