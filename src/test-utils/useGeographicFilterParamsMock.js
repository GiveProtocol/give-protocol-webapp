// Mock for @/hooks/useGeographicFilterParams
// Mapped via moduleNameMapper.
import { jest } from "@jest/globals";

export const useGeographicFilterParams = jest.fn(() => ({
  filterState: "all",
  filterCountry: null,
}));
