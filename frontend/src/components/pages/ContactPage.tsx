import React, { memo, useState, useCallback, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import SEOHelmet from '../common/SEOHelmet';
import ContactForm from '../contact/ContactForm';
import ContactInfo from '../contact/ContactInfo';
import { useForm } from '../../contexts/FormContext';

const ContactPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const {
    contactForm,
    updateContactForm,
    isSubmitting,
    submitError,
    submitSuccess,
    submitContactForm,
    clearSubmitState,
  } = useForm();
  const [isOnline] = useState(navigator.onLine);

  const handleInputChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      updateContactForm(name as keyof typeof contactForm, value);
    },
    [updateContactForm]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await submitContactForm();
    },
    [submitContactForm]
  );

  return (
    <>
      <SEOHelmet
        title={t('contact.title') + ' | ' + t('common.companyName')}
        description={t('contact.subtitle')}
        url="https://researcherhojin.github.io/emelmujiro/contact"
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="max-w-2xl mx-auto mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  {t('contactPage.successMessage')}
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 ml-9">
                {t('contactPage.successDetail')}
              </p>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div
              className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 cursor-pointer"
              onClick={clearSubmitState}
            >
              {submitError}
            </div>
          )}

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                <ContactForm
                  formData={{
                    name: contactForm.name,
                    email: contactForm.email,
                    phone: contactForm.phone,
                    company: contactForm.company,
                    inquiryType: contactForm.inquiryType as
                      | 'consulting'
                      | 'education'
                      | 'llm'
                      | 'data',
                    message: contactForm.message,
                  }}
                  isSubmitting={isSubmitting}
                  isOnline={isOnline}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div>
              <ContactInfo />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

ContactPage.displayName = 'ContactPage';

export default ContactPage;
