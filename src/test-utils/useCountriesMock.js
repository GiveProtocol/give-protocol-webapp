// Mock for @/hooks/useCountries
// Mapped via moduleNameMapper — useCountries is a jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const useCountries = jest.fn(() => ({
  countries: [{ code: "US", name: "United States" }],
}));
