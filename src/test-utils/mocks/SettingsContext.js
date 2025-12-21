/**
 * Mock implementation of SettingsContext for testing
 */
import React, { createContext, useContext } from 'react';

const mockValue = {
  language: 'en',
  setLanguage: () => {},
  currency: 'USD',
  setCurrency: () => {},
  theme: 'light',
  setTheme: () => {},
  languageOptions: [{ value: 'en', label: 'English' }],
  currencyOptions: [{ value: 'USD', label: 'US Dollar', symbol: '$' }],
};

const SettingsContext = createContext(mockValue);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => (
  React.createElement(SettingsContext.Provider, { value: mockValue }, children)
);
