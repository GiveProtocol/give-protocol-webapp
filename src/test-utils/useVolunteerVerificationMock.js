// Mock for @/hooks/useVolunteerVerification
// Mapped via moduleNameMapper — useVolunteerVerification is a jest.fn() so
// tests can call mockReturnValue to supply per-test return values.
import { jest } from "@jest/globals";

export const useVolunteerVerification = jest.fn(() => ({
  acceptApplication: jest.fn(),
  verifyHours: jest.fn(),
  loading: false,
  error: null,
}));
