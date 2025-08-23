import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  ChangeEvent,
  FormEvent,
} from 'react';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { registerBackgroundSync, SYNC_TAGS } from '../../utils/backgroundSync';
import {
  isValidEmail,
  isValidPhone,
  isWithinLength,
} from '../../utils/security';
import SEOHelmet from '../common/SEOHelmet';
import { PageLoading } from '../common/UnifiedLoading';
import ContactForm from '../contact/ContactForm';
import ContactInfo from '../contact/ContactInfo';
import ServiceCards from '../contact/ServiceCards';
import logger from '../../utils/logger';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  inquiryType: 'consulting' | 'education' | 'llm' | 'data';
  message: string;
}

const ContactPage: React.FC = memo(() => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: 'consulting',
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
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      alert('필수 항목을 모두 입력해주세요.');
      return false;
    }

    // Validate email format
    if (!isValidEmail(formData.email)) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    // Validate phone format if provided
    if (formData.phone && !isValidPhone(formData.phone)) {
      alert('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)');
      return false;
    }

    // Validate message length (10-1000 characters)
    if (
      formData.message.length < 10 ||
      !isWithinLength(formData.message, 1000)
    ) {
      alert('문의 내용은 10자 이상 1000자 이하로 작성해주세요.');
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        if (!isOnline) {
          // Store form data for background sync
          const syncData = {
            ...formData,
            timestamp: Date.now(),
          };
          localStorage.setItem('pendingContact', JSON.stringify(syncData));

          // Register background sync
          await registerBackgroundSync(SYNC_TAGS.CONTACT_FORM);

          setShowOfflineMessage(true);
          setTimeout(() => setShowOfflineMessage(false), 5000);

          // Clear form
          setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            inquiryType: 'consulting',
            message: '',
          });
        } else {
          // Online - submit form
          try {
            await api.createContact(formData);

            // In production, use mailto as fallback
            if (process.env.NODE_ENV === 'production') {
              const inquiryTypeMap = {
                consulting: 'AI 컨설팅',
                education: '기업 AI 교육',
                llm: 'LLM 솔루션',
                data: '데이터 분석',
              };
              const subject = `[${inquiryTypeMap[formData.inquiryType]} 문의] ${formData.company || '개인'} - ${formData.name}`;

              const body = `
안녕하세요. 에멜무지로 문의드립니다.

■ 문의자 정보
- 이름: ${formData.name}
- 이메일: ${formData.email}
- 전화번호: ${formData.phone || '미제공'}
- 회사/기관: ${formData.company || '개인'}

■ 문의 유형: ${inquiryTypeMap[formData.inquiryType]}

■ 문의 내용:
${formData.message}

감사합니다.
              `.trim();

              const mailtoLink = `mailto:${process.env.REACT_APP_CONTACT_EMAIL || 'researcherhojin@gmail.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

              // Show success message before opening mailto
              alert(
                '문의 양식이 준비되었습니다. 이메일 클라이언트가 열립니다.'
              );

              // Clear form first
              setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                inquiryType: 'consulting',
                message: '',
              });

              // Open mailto link
              window.location.href = mailtoLink;
            } else {
              // Development environment - API success
              alert(
                '문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.'
              );

              // Clear form
              setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                inquiryType: 'consulting',
                message: '',
              });

              // Navigate to home after success
              setTimeout(() => navigate('/'), 2000);
            }
          } catch (error) {
            // If there's an error, log it but still try mailto
            logger.warn(
              `문의 처리 중 오류: ${error instanceof Error ? error.message : 'Unknown error'}`
            );

            // Fallback to mailto
            const inquiryTypeMap = {
              consulting: 'AI 컨설팅',
              education: '기업 AI 교육',
              llm: 'LLM 솔루션',
              data: '데이터 분석',
            };
            const subject = `[${inquiryTypeMap[formData.inquiryType]} 문의] ${formData.company || '개인'} - ${formData.name}`;

            const body = `
안녕하세요. 에멜무지로 문의드립니다.

■ 문의자 정보
- 이름: ${formData.name}
- 이메일: ${formData.email}
- 전화번호: ${formData.phone || '미제공'}
- 회사/기관: ${formData.company || '개인'}

■ 문의 유형: ${inquiryTypeMap[formData.inquiryType]}

■ 문의 내용:
${formData.message}

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
    [formData, isOnline, navigate, validateForm]
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Show loading skeleton while page is loading
  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <>
      <SEOHelmet
        title="문의하기 - AI 컨설팅 및 교육 상담"
        description="에멜무지로의 AI 컨설팅, 기업 교육, LLM 솔루션 등에 대해 문의하세요. 전문가가 빠르게 답변드립니다."
        keywords="AI 컨설팅 문의, 기업 AI 교육 상담, LLM 솔루션 문의, 데이터 분석 상담"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="뒤로 가기"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>뒤로</span>
              </button>

              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">온라인</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm">오프라인</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              문의하기
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              AI 솔루션에 대한 궁금한 점이나 상담이 필요하신가요?
            </p>
          </div>

          {/* Service Cards */}
          <div className="mb-12">
            <ServiceCards />
          </div>

          {/* Contact Form and Info Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form - 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  문의 양식
                </h2>

                <ContactForm
                  formData={formData}
                  isSubmitting={isSubmitting}
                  isOnline={isOnline}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>

            {/* Contact Information - 1 column */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  연락처 정보
                </h2>

                <ContactInfo />
              </div>
            </div>
          </div>
        </div>

        {/* Offline Message Toast */}
        {showOfflineMessage && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-lg p-4 max-w-sm animate-slide-up">
            <div className="flex items-center space-x-2">
              <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  오프라인 저장됨
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  인터넷 연결 시 자동으로 전송됩니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

ContactPage.displayName = 'ContactPage';

export default ContactPage;
