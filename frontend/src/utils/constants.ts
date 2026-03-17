/**
 * Application-wide constants
 */
import i18n from '../i18n';

// Inquiry type mappings
export const getInquiryTypeMap = () => ({
  consulting: i18n.t('constants.inquiryTypes.consulting'),
  education: i18n.t('constants.inquiryTypes.education'),
  llm: i18n.t('constants.inquiryTypes.llm'),
  data: i18n.t('constants.inquiryTypes.data'),
});

// Site URL (canonical base for SEO, OG tags, structured data)
export const SITE_URL = 'https://emelmujiro.com';

// Contact information
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'researcherhojin@gmail.com';

// Form limits
export const FORM_LIMITS = {
  name: { min: 2, max: 50 },
  email: { min: 5, max: 100 },
  phone: { min: 10, max: 20 },
  company: { min: 0, max: 100 },
  message: { min: 10, max: 1000 },
} as const;

// Business hours
export const getBusinessHours = () => ({
  weekdays: '09:00 - 18:00',
  weekends: i18n.t('constants.businessHours.weekends'),
});

// Response times
export const getResponseTime = () => i18n.t('constants.responseTime');

// Service categories
export const getServiceCategories = () => [
  {
    id: 'consulting',
    name: i18n.t('constants.serviceCategories.consulting.name'),
    description: i18n.t('constants.serviceCategories.consulting.description'),
    features: i18n.t('constants.serviceCategories.consulting.features', {
      returnObjects: true,
    }) as string[],
  },
  {
    id: 'education',
    name: i18n.t('constants.serviceCategories.education.name'),
    description: i18n.t('constants.serviceCategories.education.description'),
    features: i18n.t('constants.serviceCategories.education.features', {
      returnObjects: true,
    }) as string[],
  },
  {
    id: 'llm',
    name: i18n.t('constants.serviceCategories.llm.name'),
    description: i18n.t('constants.serviceCategories.llm.description'),
    features: i18n.t('constants.serviceCategories.llm.features', {
      returnObjects: true,
    }) as string[],
  },
  {
    id: 'data',
    name: i18n.t('constants.serviceCategories.data.name'),
    description: i18n.t('constants.serviceCategories.data.description'),
    features: i18n.t('constants.serviceCategories.data.features', {
      returnObjects: true,
    }) as string[],
  },
];

// Supported languages
export const getLanguages = () => [
  { code: 'ko', name: i18n.t('constants.languages.ko') },
  { code: 'en', name: i18n.t('constants.languages.en') },
];

// Default meta tags
export const getDefaultMeta = () => ({
  title: i18n.t('constants.defaultMeta.title'),
  description: i18n.t('constants.defaultMeta.description'),
  keywords: i18n.t('constants.defaultMeta.keywords'),
  ogImage: `${SITE_URL}/og-image.png`,
});
