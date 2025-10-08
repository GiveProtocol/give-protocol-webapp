import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 
  | 'en' // English
  | 'es' // Spanish
  | 'de' // German
  | 'fr' // French
  | 'ja' // Japanese
  | 'zh-CN' // Chinese (Simplified)
  | 'zh-TW' // Chinese (Traditional)
  | 'th' // Thai
  | 'vi' // Vietnamese
  | 'ko' // Korean
  | 'ar' // Arabic
  | 'hi'; // Hindi

export type Currency = 
  | 'USD' // US Dollar
  | 'CAD' // Canadian Dollar
  | 'EUR' // Euro
  | 'CNY' // Chinese Yuan
  | 'JPY' // Japanese Yen
  | 'KRW' // Korean Won
  | 'AED' // UAE Dirham
  | 'AUD' // Australian Dollar
  | 'CHF' // Swiss Franc
  | 'GBP' // British Pound
  | 'INR' // Indian Rupee
  | 'MXP' // Mexican Peso
  | 'ILS' // Israeli Shekel
  | 'NGN' // Nigerian Naira
  | 'HKD' // Hong Kong Dollar
  | 'PKR'; // Pakistani Rupee

interface SettingsContextType {
  language: Language;
  setLanguage: (_language: Language) => void;
  currency: Currency;
  setCurrency: (_currency: Currency) => void;
  languageOptions: { value: Language; label: string }[];
  currencyOptions: { value: Currency; label: string; symbol: string }[];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage or use defaults
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || 'en'
  );
  
  const [currency, setCurrencyState] = useState<Currency>(
    () => (localStorage.getItem('currency') as Currency) || 'USD'
  );

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    // In a real app, this would trigger i18next language change
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
    { value: 'ja', label: '日本語' },
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'th', label: 'ไทย' },
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'ko', label: '한국어' },
    { value: 'ar', label: 'العربية' },
    { value: 'hi', label: 'हिन्दी' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
    { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
    { value: 'KRW', label: 'Korean Won', symbol: '₩' },
    { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
    { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
    { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { value: 'MXP', label: 'Mexican Peso', symbol: 'Mex$' },
    { value: 'ILS', label: 'Israeli Shekel', symbol: '₪' },
    { value: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
    { value: 'HKD', label: 'Hong Kong Dollar', symbol: 'HK$' },
    { value: 'PKR', label: 'Pakistani Rupee', symbol: '₨' }
  ];

  return (
    <SettingsContext.Provider value={{ 
      language, 
      setLanguage, 
      currency, 
      setCurrency,
      languageOptions,
      currencyOptions
    }}>
      {children}
    </SettingsContext.Provider>
  );
};