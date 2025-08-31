import React, { useState, useEffect, memo, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DarkModeToggle from './DarkModeToggle';

interface NavItem {
  label: string;
  path: string;
}

const Navbar: React.FC = memo(() => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { label: t('common.about'), path: '/about' },
    { label: t('common.blog'), path: '/blog' },
    { label: t('common.profile'), path: '/profile' },
  ];

  const handleNavigation = useCallback(
    (path: string) => {
      setIsOpen(false);

      if (path.startsWith('/#')) {
        // 홈페이지의 특정 섹션으로 이동
        const sectionId = path.substring(2);
        if (location.pathname !== '/') {
          // 다른 페이지에 있다면 홈으로 이동 후 스크롤
          navigate('/');
          setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        } else {
          // 이미 홈페이지에 있다면 바로 스크롤
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      } else {
        // 일반 페이지로 이동
        navigate(path);
      }
    },
    [location.pathname, navigate]
  );

  const isActive = useCallback(
    (path: string): boolean => {
      if (path.startsWith('/#')) {
        return location.pathname === '/' && location.hash === path.substring(1);
      }
      return location.pathname === path;
    },
    [location.pathname, location.hash]
  );

  const handleContactClick = useCallback(() => {
    setIsOpen(false);
    navigate('/contact');
  }, [navigate]);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800'
          : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-black text-gray-900 dark:text-white hover:text-gray-800 dark:hover:text-gray-100 transition-colors tracking-tight select-none focus:outline-none border-none bg-transparent"
            style={{ outline: 'none', boxShadow: 'none' }}
          >
            에멜무지로
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`text-base font-semibold transition-colors duration-200 relative focus:outline-none border-none bg-transparent ${
                  isActive(item.path)
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                style={{ outline: 'none', boxShadow: 'none' }}
              >
                <span className="relative">
                  {item.label}
                  <span
                    className={`absolute -bottom-2 left-0 right-0 h-[2px] bg-gray-900 dark:bg-white transition-transform duration-200 origin-left ${
                      isActive(item.path)
                        ? 'scale-x-100'
                        : 'scale-x-0 hover:scale-x-100'
                    }`}
                  />
                </span>
              </button>
            ))}

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            <button
              onClick={handleContactClick}
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-bold
                                rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
            >
              {t('common.contact')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <DarkModeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 text-gray-700 dark:text-gray-300
                              hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              aria-label="메뉴"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 shadow-lg">
          <div className="px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`block w-full text-left px-4 py-3 text-base font-medium
                                    transition-colors focus:outline-none ${
                                      isActive(item.path)
                                        ? 'text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-800'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-800'
                                    }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-4">
              <button
                onClick={handleContactClick}
                className="w-full px-4 py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-base
                                    font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-md active:scale-95"
              >
                {t('common.contact')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
