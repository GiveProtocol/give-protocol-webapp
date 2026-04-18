// Mock for @/services/adminSettingsService
import { jest } from "@jest/globals";

export const listAdminUsers = jest.fn(() => Promise.resolve([]));
