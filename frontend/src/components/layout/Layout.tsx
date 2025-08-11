import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import SkipLink from '../common/SkipLink';
import PWAInstallButton from '../common/PWAInstallButton';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { announceToScreenReader } from '../../utils/accessibility';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  // Define keyboard shortcuts
  useKeyboardNavigation([
    {
      key: '/',
      handler: () => {
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
        if (searchInput) {
          searchInput.focus();
          announceToScreenReader('Search input focused');
        }
      },
      description: 'Focus search',
    },
    {
      key: 'h',
      altKey: true,
      handler: () => {
        navigate('/');
        announceToScreenReader('Navigated to home page');
      },
      description: 'Go to home',
    },
    {
      key: 'b',
      altKey: true,
      handler: () => {
        navigate('/blog');
        announceToScreenReader('Navigated to blog page');
      },
      description: 'Go to blog',
    },
    {
      key: 'c',
      altKey: true,
      handler: () => {
        navigate('/contact');
        announceToScreenReader('Navigated to contact page');
      },
      description: 'Go to contact',
    },
    {
      key: 'p',
      altKey: true,
      handler: () => {
        navigate('/profile');
        announceToScreenReader('Navigated to profile page');
      },
      description: 'Go to profile',
    },
  ]);

  // Announce page changes to screen readers
  useEffect(() => {
    const title = document.title;
    announceToScreenReader(`Page loaded: ${title}`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-950 theme-transition">
      <SkipLink />

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
        className="flex-grow focus:outline-none"
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        {children || <Outlet />}
      </main>

      <Footer />

      <PWAInstallButton />

      {/* Keyboard shortcuts help (visible only to screen readers) */}
      <div className="sr-only" aria-label="Keyboard shortcuts">
        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li>Press / to focus search</li>
          <li>Press Alt+H to go home</li>
          <li>Press Alt+B to go to blog</li>
          <li>Press Alt+C to go to contact</li>
          <li>Press Alt+P to go to profile</li>
          <li>Press Escape to close modals</li>
        </ul>
      </div>
    </div>
  );
};

export default Layout;
