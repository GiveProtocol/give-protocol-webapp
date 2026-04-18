// Mock for @/hooks/useDonorData
// Mapped via moduleNameMapper — useDonorData is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const useDonorData = jest.fn(() => ({
  data: null,
  loading: false,
  error: null,
}));
