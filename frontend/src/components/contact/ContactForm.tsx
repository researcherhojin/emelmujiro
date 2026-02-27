import React, { memo, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, WifiOff } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  inquiryType: 'consulting' | 'education' | 'llm' | 'data';
  message: string;
}

interface ContactFormProps {
  formData: FormData;
  isSubmitting: boolean;
  isOnline: boolean;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ContactForm: React.FC<ContactFormProps> = memo(
  ({ formData, isSubmitting, isOnline, onInputChange, onSubmit }) => {
    const { t } = useTranslation();

    return (
      <form
        onSubmit={onSubmit}
        className="space-y-6"
        noValidate
        aria-label={t('contact.form.ariaLabel')}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('contact.form.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={t('contactPage.placeholder.name')}
              aria-required="true"
              aria-label={t('contact.form.nameAriaLabel')}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('contact.form.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="example@company.com"
              aria-required="true"
              aria-label={t('contact.form.emailAriaLabel')}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('contact.form.phone')}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="010-1234-5678"
              aria-label={t('contact.form.phoneAriaLabel')}
            />
          </div>

          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('contact.form.company')}
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={onInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={t('contactPage.placeholder.company')}
              aria-label={t('contact.form.companyAriaLabel')}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="inquiryType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('contact.form.inquiryType')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <select
            id="inquiryType"
            name="inquiryType"
            value={formData.inquiryType}
            onChange={onInputChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            aria-required="true"
            aria-label={t('contact.form.inquiryTypeAriaLabel')}
          >
            <option value="consulting">{t('contact.form.consulting')}</option>
            <option value="education">{t('contact.form.education')}</option>
            <option value="llm">{t('contact.form.llm')}</option>
            <option value="data">{t('contact.form.data')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('contact.form.message')} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={onInputChange}
            required
            rows={6}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder={t('contactPage.placeholder.message')}
            aria-required="true"
            aria-label={t('contact.form.messageAriaLabel')}
          />
        </div>

        {!isOnline && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">
                {t('contact.form.offlineMode')}
              </span>
            </div>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              {t('contact.form.offlineMessage')}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          aria-label={t('contact.form.submitAriaLabel')}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-gray-900" />
              <span>{t('contact.form.submitting')}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{t('contact.form.submit')}</span>
            </>
          )}
        </button>
      </form>
    );
  }
);

ContactForm.displayName = 'ContactForm';

export default ContactForm;
