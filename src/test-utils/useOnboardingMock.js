import { jest } from "@jest/globals";

export const useOnboarding = jest.fn(() => ({
  showChainSelection: false,
  completeOnboarding: jest.fn(),
  isOnboarding: false,
}));
