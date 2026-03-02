import React, { memo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../contexts/UIContext';

const DarkModeToggle: React.FC = memo(() => {
  const { theme, toggleTheme } = useUI();
  const { t } = useTranslation();

  const label =
    theme === 'light'
      ? t('accessibility.darkMode')
      : t('accessibility.lightMode');

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700
                 transition-all duration-200 ease-in-out group
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                 dark:focus:ring-offset-dark-900"
      aria-label={label}
      title={label}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon for light mode */}
        <Sun
          className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-300 transform
                     ${
                       theme === 'light'
                         ? 'opacity-100 rotate-0 scale-100'
                         : 'opacity-0 rotate-90 scale-0'
                     }`}
          strokeWidth={2}
        />

        {/* Moon icon for dark mode */}
        <Moon
          className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300 transform
                     ${
                       theme === 'dark'
                         ? 'opacity-100 rotate-0 scale-100'
                         : 'opacity-0 -rotate-90 scale-0'
                     }`}
          strokeWidth={2}
        />
      </div>

      {/* Hover effect indicator */}
      <div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-400/20 to-blue-400/20
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      />
    </button>
  );
});

DarkModeToggle.displayName = 'DarkModeToggle';

export default DarkModeToggle;
