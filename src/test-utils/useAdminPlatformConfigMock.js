// Mock for @/hooks/useAdminPlatformConfig
// Mapped via moduleNameMapper — useAdminPlatformConfig is a jest.fn() so tests
// can call mockReturnValue to provide per-test config state.
import { jest } from "@jest/globals";

export const useAdminPlatformConfig = jest.fn(() => ({
  configs: [],
  loading: false,
  saving: false,
  auditLog: [],
  auditLoading: false,
  fetchConfig: jest.fn().mockResolvedValue([]),
  saveConfig: jest.fn().mockResolvedValue(true),
  fetchAuditLog: jest.fn().mockResolvedValue([]),
}));
