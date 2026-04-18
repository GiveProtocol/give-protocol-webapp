// Mock for @/hooks/useAdminAuditLog
import { jest } from "@jest/globals";

export const useAdminAuditLog = jest.fn(() => ({
  entries: [],
  totalCount: 0,
  totalPages: 0,
  page: 1,
  limit: 50,
  loading: false,
  fetchAuditLog: jest.fn(),
}));
