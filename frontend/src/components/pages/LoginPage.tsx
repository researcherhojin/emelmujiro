import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LogIn, AlertTriangle } from 'lucide-react';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import { useAuth } from '../../contexts/AuthContext';
import SEOHelmet from '../common/SEOHelmet';
import { SITE_URL } from '../../utils/constants';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, isAuthenticated, error, clearError } = useAuth();
  const { localizedNavigate } = useLocalizedPath();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      localizedNavigate('/');
    }
  }, [isAuthenticated, localizedNavigate]);

  // Focus email input on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Clear error when inputs change
  useEffect(() => {
    if (error) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password.trim()) return;
      setSubmitting(true);
      try {
        await login(email, password);
        localizedNavigate('/');
      } catch {
        // error is set by AuthContext
      } finally {
        setSubmitting(false);
      }
    },
    [email, password, login, localizedNavigate]
  );

  if (isAuthenticated) return null;

  return (
    <>
      <SEOHelmet title={t('auth.login')} url={`${SITE_URL}/login`} />

      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            {t('auth.login')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                {t('auth.email')}
              </label>
              <input
                ref={emailRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
