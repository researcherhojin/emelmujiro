import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';
import { SITE_URL } from '../../utils/constants';
import ContactInfo from '../contact/ContactInfo';

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe8rXKQBFzJQbG9G-Gq2uT4dWogpga87eWGpbyhN2-vou0bBA/viewform?embedded=true';
const GOOGLE_FORM_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSe8rXKQBFzJQbG9G-Gq2uT4dWogpga87eWGpbyhN2-vou0bBA/viewform?usp=dialog';

const ContactPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <>
      <SEOHelmet
        title={t('contact.title')}
        description={t('contact.subtitle')}
        url={`${SITE_URL}/contact`}
      />
      <StructuredData type="LocalBusiness" />
      <StructuredData type="Breadcrumb" />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero */}
        <section className="pt-24 pb-12 sm:pt-32 sm:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
              {t('contact.sectionLabel')}
            </span>
            <h1 className="mt-3 text-3xl sm:mt-4 sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
              {t('contact.title')}
            </h1>
            <p className="mt-4 text-sm sm:mt-6 sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto break-keep">
              {t('contact.subtitle')}
            </p>
            <p className="mt-2 text-xs sm:text-base text-gray-500 dark:text-gray-400 break-keep">
              {t('contact.googleForm.description')}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
            {/* Google Form Embed */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('contact.googleForm.formTitle')}
                  </h2>
                  <a
                    href={GOOGLE_FORM_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    aria-label={t('contact.googleForm.openInNewTab')}
                  >
                    {t('contact.googleForm.openInNewTab')}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="relative">
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl">
                      <p className="text-gray-500 dark:text-gray-400">
                        {t('contact.googleForm.loading')}
                      </p>
                    </div>
                  )}
                  <iframe
                    src={GOOGLE_FORM_URL}
                    title={t('contact.googleForm.formTitle')}
                    className="w-full rounded-xl border-0"
                    style={{ height: '1200px' }}
                    onLoad={() => setIframeLoaded(true)}
                  >
                    {t('contact.googleForm.loading')}
                  </iframe>
                </div>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div>
              <ContactInfo />
            </div>
          </div>
        </section>
      </div>
    </>
  );
});

ContactPage.displayName = 'ContactPage';

export default ContactPage;
