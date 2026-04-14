// Mock for @/utils/locationResolver
// Mapped via moduleNameMapper.
import { jest } from "@jest/globals";

export const resolveLocation = jest.fn((input) => ({
  id: input,
  type: "country",
  label: input,
}));
