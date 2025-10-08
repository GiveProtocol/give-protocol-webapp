import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Custom hook that extends react-i18next's useTranslation hook
 * with application-specific functionality
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  const { language, setLanguage } = useSettings();
  
  // Change language if it doesn't match the current i18n language
  if (i18n.language !== language) {
    i18n.changeLanguage(language);
  }
  
  return {
    t,
    i18n,
    language,
    changeLanguage: setLanguage
  };
};