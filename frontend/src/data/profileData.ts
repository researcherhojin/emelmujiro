import i18n from '../i18n';

export type OrgType = 'enterprise' | 'moel' | 'public' | 'academic';

export interface TeachingItem {
  organization: string;
  title: string;
  year: number;
  orgType: OrgType;
  upcoming?: boolean;
  visibleAfter?: string; // ISO date string — hide until this date
}

export const ORG_TYPES: OrgType[] = ['enterprise', 'moel', 'public', 'academic'];

export const getTeachingHistory = (): TeachingItem[] => [
  // 2026
  {
    organization: i18n.t('teachingHistory.0.org'),
    title: i18n.t('teachingHistory.0.title'),
    year: 2026,
    orgType: 'public',
  },
  {
    organization: i18n.t('teachingHistory.1.org'),
    title: i18n.t('teachingHistory.1.title'),
    year: 2026,
    orgType: 'academic',
    visibleAfter: '2026-04-03',
  },
  {
    organization: i18n.t('teachingHistory.2.org'),
    title: i18n.t('teachingHistory.2.title'),
    year: 2026,
    orgType: 'public',
    upcoming: true,
  },
  {
    organization: i18n.t('teachingHistory.3.org'),
    title: i18n.t('teachingHistory.3.title'),
    year: 2026,
    orgType: 'public',
    upcoming: true,
  },
  // 2025
  {
    organization: i18n.t('teachingHistory.4.org'),
    title: i18n.t('teachingHistory.4.title'),
    year: 2025,
    orgType: 'moel',
  },
  {
    organization: i18n.t('teachingHistory.5.org'),
    title: i18n.t('teachingHistory.5.title'),
    year: 2025,
    orgType: 'moel',
  },
  {
    organization: i18n.t('teachingHistory.6.org'),
    title: i18n.t('teachingHistory.6.title'),
    year: 2025,
    orgType: 'public',
  },
  {
    organization: i18n.t('teachingHistory.7.org'),
    title: i18n.t('teachingHistory.7.title'),
    year: 2025,
    orgType: 'public',
  },
  {
    organization: i18n.t('teachingHistory.8.org'),
    title: i18n.t('teachingHistory.8.title'),
    year: 2025,
    orgType: 'moel',
  },
  // 2024
  {
    organization: i18n.t('teachingHistory.9.org'),
    title: i18n.t('teachingHistory.9.title'),
    year: 2024,
    orgType: 'public',
  },
  {
    organization: i18n.t('teachingHistory.10.org'),
    title: i18n.t('teachingHistory.10.title'),
    year: 2024,
    orgType: 'moel',
  },
  {
    organization: i18n.t('teachingHistory.11.org'),
    title: i18n.t('teachingHistory.11.title'),
    year: 2024,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.12.org'),
    title: i18n.t('teachingHistory.12.title'),
    year: 2024,
    orgType: 'moel',
  },
  {
    organization: i18n.t('teachingHistory.13.org'),
    title: i18n.t('teachingHistory.13.title'),
    year: 2024,
    orgType: 'moel',
  },
  {
    organization: i18n.t('teachingHistory.14.org'),
    title: i18n.t('teachingHistory.14.title'),
    year: 2024,
    orgType: 'enterprise',
  },
  // 2023
  {
    organization: i18n.t('teachingHistory.15.org'),
    title: i18n.t('teachingHistory.15.title'),
    year: 2023,
    orgType: 'moel',
  },
  {
    organization: i18n.t('teachingHistory.16.org'),
    title: i18n.t('teachingHistory.16.title'),
    year: 2023,
    orgType: 'academic',
  },
  {
    organization: i18n.t('teachingHistory.17.org'),
    title: i18n.t('teachingHistory.17.title'),
    year: 2023,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.18.org'),
    title: i18n.t('teachingHistory.18.title'),
    year: 2023,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.19.org'),
    title: i18n.t('teachingHistory.19.title'),
    year: 2023,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.20.org'),
    title: i18n.t('teachingHistory.20.title'),
    year: 2023,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.21.org'),
    title: i18n.t('teachingHistory.21.title'),
    year: 2023,
    orgType: 'academic',
  },
  {
    organization: i18n.t('teachingHistory.22.org'),
    title: i18n.t('teachingHistory.22.title'),
    year: 2023,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.23.org'),
    title: i18n.t('teachingHistory.23.title'),
    year: 2023,
    orgType: 'academic',
  },
  {
    organization: i18n.t('teachingHistory.24.org'),
    title: i18n.t('teachingHistory.24.title'),
    year: 2023,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.25.org'),
    title: i18n.t('teachingHistory.25.title'),
    year: 2023,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.26.org'),
    title: i18n.t('teachingHistory.26.title'),
    year: 2023,
    orgType: 'academic',
  },
  {
    organization: i18n.t('teachingHistory.27.org'),
    title: i18n.t('teachingHistory.27.title'),
    year: 2023,
    orgType: 'public',
  },
  // 2022
  {
    organization: i18n.t('teachingHistory.28.org'),
    title: i18n.t('teachingHistory.28.title'),
    year: 2022,
    orgType: 'academic',
  },
  {
    organization: i18n.t('teachingHistory.29.org'),
    title: i18n.t('teachingHistory.29.title'),
    year: 2022,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.30.org'),
    title: i18n.t('teachingHistory.30.title'),
    year: 2022,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.31.org'),
    title: i18n.t('teachingHistory.31.title'),
    year: 2022,
    orgType: 'public',
  },
  {
    organization: i18n.t('teachingHistory.32.org'),
    title: i18n.t('teachingHistory.32.title'),
    year: 2022,
    orgType: 'public',
  },
  {
    organization: i18n.t('teachingHistory.33.org'),
    title: i18n.t('teachingHistory.33.title'),
    year: 2022,
    orgType: 'enterprise',
  },
  {
    organization: i18n.t('teachingHistory.34.org'),
    title: i18n.t('teachingHistory.34.title'),
    year: 2022,
    orgType: 'academic',
  },
  {
    organization: i18n.t('teachingHistory.35.org'),
    title: i18n.t('teachingHistory.35.title'),
    year: 2022,
    orgType: 'academic',
  },
  {
    organization: i18n.t('teachingHistory.36.org'),
    title: i18n.t('teachingHistory.36.title'),
    year: 2022,
    orgType: 'public',
  },
  {
    organization: i18n.t('teachingHistory.37.org'),
    title: i18n.t('teachingHistory.37.title'),
    year: 2022,
    orgType: 'enterprise',
  },
];
