// Mock for @/contexts/SettingsContext
// Mapped via moduleNameMapper so all SettingsContext imports get this mock
import { jest } from "@jest/globals";

export const useSettings = jest.fn(() => ({
  language: "en",
  setLanguage: jest.fn(),
  currency: "USD",
  setCurrency: jest.fn(),
  theme: "light",
  setTheme: jest.fn(),
  languageOptions: [],
  currencyOptions: [],
}));

export const SettingsProvider = ({ children }) => children;
