// Mock for @/services/adminDashboardService
// Mapped via moduleNameMapper — each export is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const getAdminDashboardStats = jest.fn(() => Promise.resolve(null));
export const getAdminRecentActivity = jest.fn(() =>
  Promise.resolve({ events: [], totalCount: 0, page: 1, limit: 50, totalPages: 0 }),
);
export const getAdminAlerts = jest.fn(() => Promise.resolve([]));
