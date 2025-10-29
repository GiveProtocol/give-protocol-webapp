import { useEffect } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Custom hook that extends react-i18next's useTranslation hook
 * with application-specific functionality (SSR-safe)
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  const { language, setLanguage } = useSettings();

  // Change language in useEffect to avoid SSR issues
  useEffect(() => {
    if (i18n.changeLanguage && i18n.language !== language) {
      i18n.changeLanguage(language).catch((error) => {
        console.error('Failed to change language:', error);
      });
    }
  }, [i18n, language]);

  return {
    t,
    i18n,
    language,
    changeLanguage: setLanguage
  };
};