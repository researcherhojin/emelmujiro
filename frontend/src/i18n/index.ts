import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation resources
import koTranslation from './locales/ko';
import enTranslation from './locales/en';

export const defaultNS = 'common';
export const resources = {
  ko: koTranslation,
  en: enTranslation,
} as const;

// Use different configurations for different environments
const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';

let i18nInstance = i18n;

if (!isTest) {
  // Use HTTP backend and language detection in non-test environments
  i18nInstance = i18nInstance
    .use(Backend)
    .use(LanguageDetector);
}

i18nInstance
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    defaultNS,
    lng: isTest ? 'ko' : undefined, // Set fixed language for tests
    fallbackLng: 'ko', // Korean as default language
    debug: isDev,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Language detection options (only for non-test environments)
    ...(isTest ? {} : {
      detection: {
        order: [
          'localStorage',
          'navigator',
          'htmlTag',
          'path',
          'subdomain',
        ],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
    }),

    // Support for namespaces
    ns: ['common', 'navigation', 'home', 'about', 'contact', 'blog', 'profile'],

    // Load resources synchronously for better UX
    initImmediate: false,

    // Advanced options
    returnObjects: true,
    returnEmptyString: false,
    returnNull: false,

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Backend options (only for non-test environments)
    ...(isTest ? {} : {
      backend: {
        loadPath: '/emelmujiro/locales/{{lng}}/{{ns}}.json',
        addPath: '/emelmujiro/locales/{{lng}}/{{ns}}.json',
      },
    }),

    // Supported languages
    supportedLngs: ['ko', 'en'],
    nonExplicitSupportedLngs: false,

    // Clean code
    cleanCode: true,
    
    // React options
    react: {
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
      useSuspense: false,
    },
  });

export default i18n;