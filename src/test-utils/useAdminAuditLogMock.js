// Mock for @/hooks/useAdminAuditLog
// Mapped via moduleNameMapper — useAdminAuditLog is a jest.fn() so tests
// can call mockReturnValue to provide per-test audit log state.
import { jest } from "@jest/globals";

export const useAdminAuditLog = jest.fn(() => ({
  entries: [],
  totalCount: 0,
  totalPages: 0,
  page: 1,
  limit: 50,
  loading: false,
  fetchAuditLog: jest.fn().mockResolvedValue({
    entries: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  }),
}));
