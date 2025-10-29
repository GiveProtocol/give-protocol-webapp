import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources } from './resources';

// SSR-safe initialization
const isServer = typeof window === 'undefined';

const i18nInstance = i18n
  // pass the i18n instance to react-i18next
  .use(initReactI18next);

// Only use LanguageDetector on client-side
if (!isServer) {
  i18nInstance.use(LanguageDetector);
}

i18nInstance.init({
  resources,
  fallbackLng: 'en',
  lng: isServer ? 'en' : undefined, // Set default language for SSR
  debug: import.meta.env.DEV && !isServer,

  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },

  // detection options (client-only)
  ...(!isServer && {
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    }
  }),

  // React-specific options
  react: {
    useSuspense: false, // Disable suspense for SSR compatibility
  }
});

export default i18n;