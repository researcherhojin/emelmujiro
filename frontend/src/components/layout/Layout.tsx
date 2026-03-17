import React, { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import SkipLink from '../common/SkipLink';
import { announceToScreenReader } from '../../utils/accessibility';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  // Show banner only on iOS KakaoTalk — Android renders fine via legacy plugin
  const [showKakaoBanner, setShowKakaoBanner] = useState(
    () => !!window.__isKakaoInApp && !window.__isKakaoAndroid
  );

  const handleOpenExternal = useCallback(() => {
    const url = window.location.href;
    // iOS KakaoTalk: use official kakaotalk:// scheme to open external browser
    location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url);
  }, []);

  const dismissBanner = useCallback(() => {
    setShowKakaoBanner(false);
  }, []);

  // Announce page changes to screen readers
  useEffect(() => {
    const title = document.title;
    announceToScreenReader(t('accessibility.pageLoaded', { title }));
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-950 theme-transition">
      <SkipLink />

      {/* KakaoTalk in-app browser banner */}
      {showKakaoBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-yellow-400 text-gray-900 text-sm text-center px-4 py-2 flex items-center justify-center gap-2">
          <span>{t('common.kakaoBanner')}</span>
          <button
            onClick={handleOpenExternal}
            className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-medium"
          >
            {t('common.openExternal')}
          </button>
          <button
            onClick={dismissBanner}
            className="text-gray-700 px-1 text-lg leading-none"
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>
      )}

      {/* Announce region for dynamic content */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="page-announcements"
      />

      <Navbar />

      <main
        id="main-content"
        className="flex-grow pt-20 focus:outline-none"
        tabIndex={-1}
        role="main"
        aria-label={t('accessibility.mainContent')}
      >
        {children || <Outlet />}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
