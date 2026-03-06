import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface ProfileHeroProps {
  onBackClick: () => void;
}

const ProfileHero: React.FC<ProfileHeroProps> = memo(({ onBackClick }) => {
  const { t } = useTranslation();

  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
          {t('profilePage.sectionLabel')}
        </span>
        <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
          {t('profilePage.name')}
        </h1>
        <p className="mt-6 text-xl font-medium text-gray-600 dark:text-gray-400">
          {t('profilePage.role')}
        </p>
        <div className="mt-8 flex justify-center">
          <button
            onClick={onBackClick}
            className="inline-flex items-center px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all focus:outline-none"
          >
            ← {t('profilePage.backToMain')}
          </button>
        </div>
      </div>
    </section>
  );
});

ProfileHero.displayName = 'ProfileHero';

export default ProfileHero;
