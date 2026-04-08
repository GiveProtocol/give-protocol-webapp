// Mock for @/hooks/useWalletAlias
// Mapped via moduleNameMapper — useWalletAlias is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const useWalletAlias = jest.fn(() => ({
  alias: null,
  setAlias: jest.fn().mockResolvedValue(undefined),
  isLoading: false,
  error: null,
}));
