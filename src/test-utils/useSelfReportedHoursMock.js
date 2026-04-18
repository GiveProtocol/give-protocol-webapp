// Mock for @/hooks/useSelfReportedHours
// Mapped via moduleNameMapper so all useSelfReportedHours imports get this mock
import { jest } from "@jest/globals";

export const useSelfReportedHours = jest.fn(() => ({
  hours: [],
  stats: null,
  loading: false,
  error: null,
  filters: {},
  setFilters: jest.fn(),
  createHours: jest.fn(),
  updateHours: jest.fn(),
  deleteHours: jest.fn(),
  requestHoursValidation: jest.fn(),
  cancelRequest: jest.fn(),
  resubmitRequest: jest.fn(),
  refetch: jest.fn(),
  getHoursById: jest.fn(),
}));
