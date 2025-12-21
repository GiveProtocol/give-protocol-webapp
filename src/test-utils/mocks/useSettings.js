/**
 * Mock implementation of useSettings hook for testing
 */
export const useSettings = () => ({
  language: 'en',
  setLanguage: () => {},
  currency: 'USD',
  setCurrency: () => {},
  theme: 'light',
  setTheme: () => {},
  languageOptions: [{ value: 'en', label: 'English' }],
  currencyOptions: [{ value: 'USD', label: 'US Dollar', symbol: '$' }],
});

export const SettingsProvider = ({ children }) => children;
