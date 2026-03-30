import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Share2, MessageCircle, Mail, ExternalLink, CheckCircle } from 'lucide-react';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import SEOHelmet from '../common/SEOHelmet';
import { SITE_URL } from '../../utils/constants';

interface SharedContent {
  title?: string;
  text?: string;
  url?: string;
}

const SharePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { localizedNavigate } = useLocalizedPath();
  const [sharedContent, setSharedContent] = useState<SharedContent>({});
  const [isProcessing, setIsProcessing] = useState(true);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSaveSuccess = useCallback(() => {
    setShowSavedToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setShowSavedToast(false);
      localizedNavigate('/');
    }, 1500);
  }, [localizedNavigate]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // Parse shared content from URL parameters
    const searchParams = new URLSearchParams(location.search);

    const content: SharedContent = {
      title: searchParams.get('title') || '',
      text: searchParams.get('text') || '',
      url: searchParams.get('url') || '',
    };

    setSharedContent(content);
    setIsProcessing(false);
  }, [location.search]);

  const handleSendInquiry = () => {
    // Navigate to contact page with pre-filled content
    const message = `
${t('share.inquiryTemplate')}

${t('share.fieldTitle')}: ${sharedContent.title || ''}
${t('share.fieldContent')}: ${sharedContent.text || ''}
${t('share.fieldLink')}: ${sharedContent.url || ''}

${t('share.inquiryFooter')}
    `.trim();

    localizedNavigate('/contact', {
      state: {
        prefilledMessage: message,
        subject: sharedContent.title || t('share.defaultSubject'),
      },
    });
  };

  const handleViewContent = () => {
    window.open(sharedContent.url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveForLater = () => {
    // Save to local storage or favorites
    let savedItems: SharedContent[];
    try {
      savedItems = JSON.parse(localStorage.getItem('saved-content') || '[]');
    } catch {
      savedItems = [];
    }
    const newItem = {
      ...sharedContent,
      savedAt: new Date().toISOString(),
      id: crypto.randomUUID(),
    };

    savedItems.unshift(newItem);
    localStorage.setItem('saved-content', JSON.stringify(savedItems.slice(0, 50))); // Keep only 50 items

    showSaveSuccess();
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{t('share.processing')}</p>
        </div>
      </div>
    );
  }

  const hasContent = sharedContent.title || sharedContent.text || sharedContent.url;

  if (!hasContent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('share.noContent')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t('share.noContentDescription')}</p>
          <button
            onClick={() => localizedNavigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {t('share.goHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <SEOHelmet
        title={t('share.title')}
        description={t('share.howToUse')}
        url={`${SITE_URL}/share`}
      />
      {showSavedToast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white"
          role="alert"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{t('share.saved')}</span>
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('share.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{t('share.howToUse')}</p>
        </div>

        {/* Shared Content Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('share.sharedContent')}
          </h2>

          {sharedContent.title && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('share.fieldTitle')}
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
                {sharedContent.title}
              </p>
            </div>
          )}

          {sharedContent.text && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('share.fieldContent')}
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded whitespace-pre-wrap">
                {sharedContent.text}
              </p>
            </div>
          )}

          {sharedContent.url && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('share.fieldLink')}
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <a
                  href={sharedContent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {sharedContent.url}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={handleSendInquiry}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium
                       transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{t('share.sendInquiry')}</span>
          </button>

          {sharedContent.url && (
            <button
              onClick={handleViewContent}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium
                         transition-colors flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span>{t('share.viewOriginal')}</span>
            </button>
          )}

          <button
            onClick={handleSaveForLater}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-medium
                       transition-colors flex items-center justify-center space-x-2"
          >
            <Mail className="w-5 h-5" />
            <span>{t('share.saveLater')}</span>
          </button>

          <button
            onClick={() => localizedNavigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg font-medium
                       transition-colors flex items-center justify-center space-x-2"
          >
            <span>{t('share.goToHome')}</span>
          </button>
        </div>

        {/* Additional Options */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('share.otherOptions')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => localizedNavigate('/insights')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              {t('share.browseBlog')}
            </button>
            <button
              onClick={() => localizedNavigate('/')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              {t('share.aboutCompany')}
            </button>
            <button
              onClick={() => localizedNavigate('/contact')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              {t('share.directInquiry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
