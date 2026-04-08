import { jest } from "@jest/globals";

export const useCurrencyContext = jest.fn(() => ({
  selectedCurrency: "USD",
  setSelectedCurrency: jest.fn(),
  exchangeRates: {},
  isLoading: false,
}));

export const CurrencyProvider = ({ children }) => children;
