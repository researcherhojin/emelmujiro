import {
  LucideIcon,
  GraduationCap,
  Code2,
  MessageSquare,
  Eye,
} from 'lucide-react';
import i18n from '../i18n';

export interface ServiceDetail {
  title: string;
  icon: LucideIcon;
  description: string;
  details: string[];
}

export interface Services {
  [key: string]: ServiceDetail;
}

export const getServices = (): Services => ({
  'ai-education': {
    title: i18n.t('footerServices.education.title'),
    icon: GraduationCap,
    description: i18n.t('footerServices.education.description'),
    details: [
      i18n.t('footerServices.education.details.0'),
      i18n.t('footerServices.education.details.1'),
      i18n.t('footerServices.education.details.2'),
      i18n.t('footerServices.education.details.3'),
      i18n.t('footerServices.education.details.4'),
      i18n.t('footerServices.education.details.5'),
    ],
  },
  'ai-consulting': {
    title: i18n.t('footerServices.consulting.title'),
    icon: Code2,
    description: i18n.t('footerServices.consulting.description'),
    details: [
      i18n.t('footerServices.consulting.details.0'),
      i18n.t('footerServices.consulting.details.1'),
      i18n.t('footerServices.consulting.details.2'),
      i18n.t('footerServices.consulting.details.3'),
      i18n.t('footerServices.consulting.details.4'),
      i18n.t('footerServices.consulting.details.5'),
    ],
  },
  'llm-genai': {
    title: i18n.t('footerServices.llmGenai.title'),
    icon: MessageSquare,
    description: i18n.t('footerServices.llmGenai.description'),
    details: [
      i18n.t('footerServices.llmGenai.details.0'),
      i18n.t('footerServices.llmGenai.details.1'),
      i18n.t('footerServices.llmGenai.details.2'),
      i18n.t('footerServices.llmGenai.details.3'),
      i18n.t('footerServices.llmGenai.details.4'),
      i18n.t('footerServices.llmGenai.details.5'),
    ],
  },
  'computer-vision': {
    title: i18n.t('footerServices.computerVision.title'),
    icon: Eye,
    description: i18n.t('footerServices.computerVision.description'),
    details: [
      i18n.t('footerServices.computerVision.details.0'),
      i18n.t('footerServices.computerVision.details.1'),
      i18n.t('footerServices.computerVision.details.2'),
      i18n.t('footerServices.computerVision.details.3'),
      i18n.t('footerServices.computerVision.details.4'),
      i18n.t('footerServices.computerVision.details.5'),
    ],
  },
});

// For backward compatibility, export a static reference
// Components should prefer getServices() for dynamic language support
export const services: Services = getServices();
