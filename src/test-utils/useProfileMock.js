// Mock for @/hooks/useProfile
// Mapped via moduleNameMapper — useProfile is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const useProfile = jest.fn(() => ({
  profile: null,
  loading: false,
  error: null,
  updateProfile: jest.fn(),
}));
