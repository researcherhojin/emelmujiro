import React, { useState, useEffect, useCallback, memo, ChangeEvent, FormEvent } from 'react';
import { ArrowLeft, Mail, Phone, Send, Code, BookOpen, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { registerBackgroundSync, SYNC_TAGS } from '../../utils/backgroundSync';
import { escapeHtml, isValidEmail, isValidPhone, isWithinLength } from '../../utils/security';
import SEOHelmet from '../common/SEOHelmet';
import Loading from '../common/Loading';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  inquiryType: 'solution' | 'education';
  message: string;
}

interface ContactIconProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  link?: string;
}

const ContactIcon: React.FC<ContactIconProps> = memo(({ icon, title, value, link }) => (
  <div className="flex items-center space-x-4">
    <div className="text-gray-600">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{title}</div>
      {link ? (
        <a
          href={link}
          className="text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors"
          aria-label={`${title}: ${value}`}
        >
          {value}
        </a>
      ) : (
        <div className="text-lg font-medium text-gray-900">{value}</div>
      )}
    </div>
  </div>
));

ContactIcon.displayName = 'ContactIcon';

const ContactPage: React.FC = memo(() => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: 'solution',
    message: '',
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Simulate loading for demonstration
    const timer = setTimeout(() => setIsLoading(false), 1000);

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        // Input validation
        if (!formData.name || !isWithinLength(formData.name, 50)) {
          alert('이름을 올바르게 입력해주세요. (최대 50자)');
          return;
        }

        if (!isValidEmail(formData.email)) {
          alert('올바른 이메일 주소를 입력해주세요.');
          return;
        }

        if (formData.phone && !isValidPhone(formData.phone)) {
          alert('올바른 전화번호를 입력해주세요.');
          return;
        }

        if (!formData.message || !isWithinLength(formData.message, 1000)) {
          alert('문의 내용을 입력해주세요. (최대 1000자)');
          return;
        }

        // If offline, save for background sync
        if (!isOnline) {
          try {
            await registerBackgroundSync(SYNC_TAGS.CONTACT_FORM, formData as any);
            setShowOfflineMessage(true);

            // Clear form
            setFormData({
              name: '',
              email: '',
              phone: '',
              company: '',
              inquiryType: 'solution',
              message: '',
            });

            // Hide message after 5 seconds
            setTimeout(() => setShowOfflineMessage(false), 5000);
            return;
          } catch (error) {
            console.error('Failed to register background sync:', error);
          }
        } else {
          // Online submission - Try API first, fallback to mailto
          try {
            // Prepare data for API
            const apiData = {
              name: formData.name,
              email: formData.email,
              phone: formData.phone || '',
              company: formData.company || '',
              inquiry_type: formData.inquiryType,
              message: formData.message,
            };

            // Try to submit via API
            await api.createContact(apiData);

            // Success - show success message
            alert('문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.');

            // Clear form
            setFormData({
              name: '',
              email: '',
              phone: '',
              company: '',
              inquiryType: 'solution',
              message: '',
            });

            // Navigate to home after success
            setTimeout(() => navigate('/'), 2000);
          } catch (error: any) {
            // If API fails, fallback to mailto
            console.warn('API 전송 실패, mailto로 폴백:', error.message);

            const subject =
              formData.inquiryType === 'education'
                ? `[교육 문의] ${formData.company || '개인'} - ${formData.name}`
                : `[AI 솔루션 문의] ${formData.company || '개인'} - ${formData.name}`;

            const body = `
안녕하세요. 에멜무지로 문의드립니다.

■ 문의자 정보
- 이름: ${escapeHtml(formData.name)}
- 이메일: ${escapeHtml(formData.email)}
- 전화번호: ${escapeHtml(formData.phone) || '미제공'}
- 회사/기관: ${escapeHtml(formData.company) || '개인'}

■ 문의 유형: ${formData.inquiryType === 'education' ? '교육 & 강의' : 'AI 솔루션 & 컨설팅'}

■ 문의 내용:
${escapeHtml(formData.message)}

감사합니다.
          `.trim();

            const mailtoLink = `mailto:${process.env.REACT_APP_CONTACT_EMAIL || 'researcherhojin@gmail.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isOnline]
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Show loading skeleton while page is loading
  if (isLoading) {
    return (
      <>
        <SEOHelmet
          title="문의하기 | 에멜무지로"
          description="AI 컨설팅 및 교육 프로그램에 대해 문의해주세요. 맞춤형 솔루션을 제공합니다."
          keywords="AI 컨설팅 문의, AI 교육 문의, 에멜무지로 연락처"
        />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Loading type="form" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHelmet
        title="문의하기 | 에멜무지로"
        description="AI 컨설팅 및 교육 프로그램에 대해 문의해주세요. 맞춤형 솔루션을 제공합니다."
        keywords="AI 컨설팅 문의, AI 교육 문의, 에멜무지로 연락처"
      />

      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={handleBack}
            className="mb-8 text-gray-600 hover:text-gray-900 flex items-center group"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            뒤로가기
          </button>

          {/* Offline Message */}
          {showOfflineMessage && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <WifiOff className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800">
                  현재 오프라인 상태입니다. 인터넷 연결이 복구되면 자동으로 문의가 전송됩니다.
                </p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">문의하기</h1>
                <p className="text-lg text-gray-600">
                  프로젝트에 대해 상담하고 싶으신가요?
                  <br />
                  언제든지 연락주세요.
                </p>
              </div>

              <div className="space-y-6">
                <ContactIcon
                  icon={<Mail className="w-5 h-5" />}
                  title="이메일"
                  value="researcherhojin@gmail.com"
                  link="mailto:researcherhojin@gmail.com"
                />
                <ContactIcon
                  icon={<Phone className="w-5 h-5" />}
                  title="연락처"
                  value="010-7279-0380"
                  link="tel:010-7279-0380"
                />
                <ContactIcon
                  icon={isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                  title="연결 상태"
                  value={isOnline ? '온라인' : '오프라인'}
                />
              </div>

              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 서비스</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Code className="w-5 h-5 mr-3" />
                    <span>AI 솔루션 개발 & 컨설팅</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-5 h-5 mr-3" />
                    <span>기업 맞춤형 AI 교육</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">프로젝트 문의</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        이름 *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        maxLength={50}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-base"
                        placeholder="홍길동"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        이메일 *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-base"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        연락처
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-base"
                        placeholder="010-1234-5678"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        회사/기관
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        maxLength={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-base"
                        placeholder="회사명 또는 기관명"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inquiryType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      문의 유형 *
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-base"
                    >
                      <option value="solution">AI 솔루션 & 컨설팅</option>
                      <option value="education">교육 & 강의</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      문의 내용 *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      maxLength={1000}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-base resize-none"
                      placeholder="프로젝트에 대해 자세히 설명해주세요..."
                    />
                    <p className="mt-2 text-sm text-gray-500">{formData.message.length}/1000</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto px-8 py-4 font-medium rounded-lg transition-colors flex items-center justify-center group ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        전송 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                        문의 보내기
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

ContactPage.displayName = 'ContactPage';

export default ContactPage;
