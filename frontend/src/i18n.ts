import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koTranslation from './i18n/locales/ko.json';
import enTranslation from './i18n/locales/en.json';

const resources = {
  ko: {
    translation: koTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

// Search engine crawlers (Googlebot, Bingbot, etc.) have no localStorage and
// their navigator.language is English, which causes i18n to render English
// content. Force Korean for bots so that Korean search results show Korean
// meta tags and page content.
const isBot =
  typeof navigator !== 'undefined' &&
  /Googlebot|bingbot|Baiduspider|yandex|DuckDuckBot|Slurp|Twitterbot|facebookexternalhit|LinkedInBot|Discordbot/i.test(
    navigator.userAgent
  );

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    debug: false, // Disable debug logs

    interpolation: {
      escapeValue: false,
    },

    // When a bot visits, skip navigator detection and fall through to htmlTag
    // (which is 'ko' from index.html), ensuring Korean content for crawlers.
    detection: {
      order: isBot
        ? ['htmlTag']
        : ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: isBot ? [] : ['localStorage'],
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
