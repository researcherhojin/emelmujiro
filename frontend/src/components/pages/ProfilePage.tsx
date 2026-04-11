import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';
import { getTeachingHistory, ORG_TYPES } from '../../data/profileData';
import type { OrgType } from '../../data/profileData';

const YEARS = [2026, 2025, 2024, 2023, 2022] as const;

const ORG_TYPE_LABEL_KEYS: Record<OrgType, string> = {
  enterprise: 'teachingHistory.filterEnterprise',
  moel: 'teachingHistory.filterMoel',
  public: 'teachingHistory.filterPublic',
  academic: 'teachingHistory.filterAcademic',
};

const ProfilePage: React.FC = memo(() => {
  const { t, i18n } = useTranslation();
  const { localizedNavigate } = useLocalizedPath();
  const [selectedOrgType, setSelectedOrgType] = useState<OrgType | null>(null);

  const handleBackClick = useCallback(() => {
    localizedNavigate('/');
  }, [localizedNavigate]);

  const teachingHistory = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return getTeachingHistory().filter((item) => !item.visibleAfter || item.visibleAfter <= now);
    // react-hooks/exhaustive-deps false positive: ESLint treats i18n.language
    // as "unnecessary" because i18n from useTranslation() is a stable
    // reference, but getTeachingHistory() internally calls i18n.t() 76 times
    // (profileData.ts). Without i18n.language in the deps the memo would
    // cache the original language forever across a language switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const filteredHistory = useMemo(() => {
    if (!selectedOrgType) return teachingHistory;
    return teachingHistory.filter((item) => item.orgType === selectedOrgType);
  }, [teachingHistory, selectedOrgType]);

  const itemsByYear = useMemo(() => {
    const map = new Map<number, typeof filteredHistory>();
    for (const year of YEARS) {
      const items = filteredHistory.filter((item) => item.year === year);
      if (items.length > 0) map.set(year, items);
    }
    return map;
  }, [filteredHistory]);

  const isFiltered = selectedOrgType !== null;

  const pillBase =
    'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-full transition-all whitespace-nowrap';
  const pillActive = 'bg-gray-900 text-white dark:bg-white dark:text-gray-900';
  const pillInactive =
    'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';

  return (
    <>
      <SEOHelmet
        title={t('profilePage.seoTitle')}
        description={t('profilePage.seoDescription')}
        keywords={t('profilePage.seoKeywords')}
      />
      <StructuredData type="Person" />
      <StructuredData type="Breadcrumb" />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero */}
        <section className="pt-28 pb-12 sm:pt-32 sm:pb-16 px-5 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
              {t('teachingHistory.sectionLabel')}
            </span>
            <h1 className="mt-3 text-4xl sm:mt-4 sm:text-5xl md:text-7xl font-black text-gray-900 dark:text-white">
              {t('teachingHistory.pageTitle')}
            </h1>
            <p className="mt-4 text-base sm:mt-6 sm:text-lg text-gray-500 dark:text-gray-400 mx-auto break-keep">
              {t('teachingHistory.pageSubtitle')}
            </p>
            <div className="mt-6 sm:mt-8 flex justify-center gap-4 sm:gap-6">
              <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                {t('teachingHistory.statsYears')}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-gray-300 dark:text-gray-600">
                ·
              </span>
              <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                {t('teachingHistory.statsCount')}
              </span>
            </div>

            <div className="mt-6 sm:mt-8">
              <button
                onClick={handleBackClick}
                className="inline-flex items-center px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all focus:outline-none"
              >
                ← {t('profilePage.backToMain')}
              </button>
            </div>
          </div>
        </section>

        {/* Org type filter */}
        <section className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedOrgType(null)}
                className={`${pillBase} ${selectedOrgType === null ? pillActive : pillInactive}`}
              >
                {t('teachingHistory.filterAll')}
              </button>
              {ORG_TYPES.map((orgType) => (
                <button
                  key={orgType}
                  onClick={() => setSelectedOrgType(selectedOrgType === orgType ? null : orgType)}
                  className={`${pillBase} ${selectedOrgType === orgType ? pillActive : pillInactive}`}
                >
                  {t(ORG_TYPE_LABEL_KEYS[orgType])}
                </button>
              ))}
            </div>
            {isFiltered && (
              <p className="mt-2 text-center text-sm text-gray-400 dark:text-gray-500">
                {t('teachingHistory.filterResultCount', { count: filteredHistory.length })}
              </p>
            )}
          </div>
        </section>

        {/* Teaching History — alternating backgrounds per year */}
        {filteredHistory.length === 0 ? (
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-400 dark:text-gray-500">
              {t('teachingHistory.noResults')}
            </p>
          </section>
        ) : (
          [...itemsByYear.entries()].map(([year, items], yearIdx) => {
            const isGray = yearIdx % 2 === 0;
            return (
              <section
                key={year}
                className={`py-10 sm:py-16 px-4 sm:px-6 lg:px-8 ${isGray ? 'bg-gray-50 dark:bg-gray-950' : 'bg-white dark:bg-gray-900'}`}
              >
                <div className="max-w-5xl mx-auto">
                  <div className="flex items-center gap-4 mb-5 sm:mb-6">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                      {year}
                    </h2>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <span className="text-sm font-bold text-gray-400 dark:text-gray-500 mr-2">
                      {items.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {items.map((item, idx) => (
                      <div
                        key={`${year}-${idx}`}
                        className={`group flex items-start justify-between gap-3 p-4 sm:p-5 rounded-2xl border-2 transition-colors hover:border-gray-900 dark:hover:border-white ${isGray ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {item.organization}
                          </p>
                          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-keep">
                            {item.title}
                          </p>
                        </div>
                        {item.upcoming && (
                          <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {t('teachingHistory.upcoming')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })
        )}

        {/* CTA */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-lg sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white break-keep">
              {t('cta.title')}
            </h2>
            <p className="mt-3 text-xs sm:mt-4 sm:text-lg text-gray-500 dark:text-gray-400 break-keep">
              {t('cta.subtitleLine1')}
              <br className="sm:hidden" /> {t('cta.subtitleLine2')}
            </p>
            <div className="mt-8">
              <button
                onClick={() => localizedNavigate('/contact')}
                className="inline-flex items-center px-8 py-4 text-base font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
              >
                {t('common.contact')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
});

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
