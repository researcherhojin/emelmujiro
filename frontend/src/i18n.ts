import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { trackLanguageSwitch } from './utils/analytics';
import { urlPrefixLookup } from './utils/urlPrefixLookup';

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

// Search engine crawlers (Googlebot, Bingbot, etc.) should respect the URL
// language prefix. For /en/* paths, they get English; for /* paths, Korean.
// Non-bot users also get URL-based detection first.
const isBot =
  typeof navigator !== 'undefined' &&
  /Googlebot|bingbot|Baiduspider|yandex|DuckDuckBot|Slurp|Twitterbot|facebookexternalhit|LinkedInBot|Discordbot/i.test(
    navigator.userAgent
  );

// Custom path detector: reads language from URL prefix (/en/*)
const pathDetector = {
  name: 'urlPrefix',
  lookup: urlPrefixLookup,
};

// Register the custom detector
const customDetector = new LanguageDetector();
customDetector.addDetector(pathDetector);

i18n
  .use(customDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    debug: false,
    showSupportNotice: false,

    interpolation: {
      escapeValue: false,
    },

    // URL prefix takes highest priority for language detection.
    // Bots: URL prefix → htmlTag (falls back to 'ko' from index.html).
    // Users: URL prefix → localStorage → navigator → htmlTag.
    detection: {
      order: isBot
        ? ['urlPrefix', 'htmlTag']
        : ['urlPrefix', 'localStorage', 'navigator', 'htmlTag'],
      caches: isBot ? [] : ['localStorage'],
    },

    react: {
      useSuspense: false,
    },
  });

i18n.on('languageChanged', (lng: string) => {
  trackLanguageSwitch(lng);
});

export default i18n;
