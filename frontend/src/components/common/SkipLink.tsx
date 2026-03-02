import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Skip Link Component for keyboard navigation
 * Provides quick access to main content for screen reader users
 * WCAG 2.1 AA Compliance - Success Criterion 2.4.1
 */
const SkipLink: React.FC = () => {
  const { t } = useTranslation();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
                 bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none
                 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.focus();
            // Check if scrollIntoView exists (may not exist in test environment)
            if (typeof mainContent.scrollIntoView === 'function') {
              mainContent.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      }}
    >
      {t('accessibility.skipToContent')}
    </a>
  );
};

export default SkipLink;
