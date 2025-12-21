/**
 * Mock implementation of useSettings hook for testing
 */
export const useSettings = () => ({
  language: "en",
  setLanguage: () => {
    /* no-op mock for testing */
  },
  currency: "USD",
  setCurrency: () => {
    /* no-op mock for testing */
  },
  theme: "light",
  setTheme: () => {
    /* no-op mock for testing */
  },
  languageOptions: [{ value: "en", label: "English" }],
  currencyOptions: [{ value: "USD", label: "US Dollar", symbol: "$" }],
});

export const SettingsProvider = ({ children }) => children;
