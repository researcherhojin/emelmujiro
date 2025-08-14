import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

const LanguageSwitcher: React.FC = memo(() => {
  const { i18n, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = useCallback(
    async (languageCode: string) => {
      try {
        await i18n.changeLanguage(languageCode);
        setIsOpen(false);

        // Store language preference
        localStorage.setItem('i18nextLng', languageCode);

        // Update HTML lang attribute
        document.documentElement.lang = languageCode;

        // Dispatch custom event for other components that might need to react
        window.dispatchEvent(
          new CustomEvent('languageChanged', {
            detail: { language: languageCode },
          })
        );
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    },
    [i18n]
  );

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    }
  }, []);

  const handleLanguageKeyDown = useCallback(
    (event: React.KeyboardEvent, languageCode: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleLanguageChange(languageCode);
      }
    },
    [handleLanguageChange]
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-colors"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        aria-label={t('accessibility.languageSelector')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 mr-2" />
        <span className="mr-1">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown
          className={`ml-2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="listbox"
          aria-label={t('accessibility.languageSelector')}
        >
          <div className="py-1">
            {languages.map((language) => {
              const isSelected = language.code === i18n.language;

              return (
                <button
                  key={language.code}
                  type="button"
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => handleLanguageChange(language.code)}
                  onKeyDown={(e) => handleLanguageKeyDown(e, language.code)}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{language.flag}</span>
                    <span>{language.name}</span>
                    {isSelected && (
                      <span className="ml-auto">
                        <svg
                          className="w-4 h-4 text-gray-600 dark:text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;
