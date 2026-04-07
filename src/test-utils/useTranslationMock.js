// Mock for @/hooks/useTranslation
// Mapped via moduleNameMapper to intercept all useTranslation imports in tests
import { jest } from "@jest/globals";

export const useTranslation = jest.fn(() => ({
  t: (key, fallback) => fallback ?? key,
  language: "en",
}));
