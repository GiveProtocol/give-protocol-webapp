// Mock for @/hooks/useAdminPlatformConfig
import { jest } from "@jest/globals";

export const useAdminPlatformConfig = jest.fn(() => ({
  configs: [],
  loading: false,
  saving: false,
  auditLog: [],
  auditLoading: false,
  fetchConfig: jest.fn(),
  saveConfig: jest.fn(),
  fetchAuditLog: jest.fn(),
}));
