// Mock for @/hooks/useContributionStats
// Mapped via moduleNameMapper — all exports are jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const useUserContributionStats = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

export const useGlobalContributionStats = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

export const useUnifiedContributions = jest.fn(() => ({
  data: [],
  isLoading: false,
  error: null,
}));

export const useDonorLeaderboard = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

export const useVolunteerLeaderboard = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));
