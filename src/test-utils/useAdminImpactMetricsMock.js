// Mock for @/hooks/useAdminImpactMetrics
// Mapped via moduleNameMapper — useAdminImpactMetrics is a jest.fn() so
// tests can call mockReturnValue to supply per-test return values.
import { jest } from "@jest/globals";

export const useAdminImpactMetrics = jest.fn(() => ({
  metrics: [],
  loading: false,
  error: null,
  fetchAllMetrics: jest.fn(),
  createMetric: jest.fn(),
  updateMetric: jest.fn(),
  deleteMetric: jest.fn(),
}));
