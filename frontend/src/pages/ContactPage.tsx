import React, { useState, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';

interface FormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

const ContactPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    // 실제 전송 로직은 필요시 추가
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 py-24">
      <div className="w-full max-w-md bg-black border border-white/20 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-8 text-white text-center">
          Contact
        </h1>
        {submitted ? (
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-white mb-4">
              {t('contactPage.successMessage')}
            </p>
            <p className="text-gray-400">{t('contactPage.successDetail')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                {t('contact.form.name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-black text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                placeholder={t('contactPage.placeholder.name')}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                {t('contact.form.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-black text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                placeholder="example@company.com"
              />
            </div>
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                {t('contact.form.company')}
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-black text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                placeholder={t('contactPage.placeholder.company')}
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                {t('contact.form.message')}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-black text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                placeholder={t('contactPage.placeholder.message')}
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {t('common.contact')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
});

ContactPage.displayName = 'ContactPage';

export default ContactPage;
