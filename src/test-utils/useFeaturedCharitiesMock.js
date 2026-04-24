// Mock for @/hooks/useFeaturedCharities
// Mapped via moduleNameMapper — useFeaturedCharities is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const useFeaturedCharities = jest.fn(() => ({
  charities: [],
  loading: false,
  error: null,
}));
