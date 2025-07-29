import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Send, Code, BookOpen, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerBackgroundSync, SYNC_TAGS } from '../../utils/backgroundSync';
import { escapeHtml, isValidEmail, isValidPhone, isWithinLength } from '../../utils/security';
import SEOHelmet from '../common/SEOHelmet';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        inquiryType: 'solution',
        message: '',
    });
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showOfflineMessage, setShowOfflineMessage] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Monitor online/offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 입력값 유효성 검사
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
                await registerBackgroundSync(SYNC_TAGS.CONTACT_FORM, formData);
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
        }

        const subject =
            formData.inquiryType === 'education'
                ? `[교육 문의] ${formData.company || '개인'} - ${formData.name}`
                : `[AI 솔루션 문의] ${formData.company || '개인'} - ${formData.name}`;

        const body = `
안녕하세요. 에멀무지로 문의드립니다.

■ 문의자 정보
- 이름: ${escapeHtml(formData.name)}
- 이메일: ${escapeHtml(formData.email)}
- 전화번호: ${escapeHtml(formData.phone) || '미제공'}
- 회사/기관: ${escapeHtml(formData.company) || '개인'}

■ 문의 유형: ${formData.inquiryType === 'education' ? '교육 & 강의' : 'AI 솔루션 & 컨설팅'}

■ 문의 내용:
${escapeHtml(formData.message)}

---
이 메일은 에멀무지로 웹사이트 문의 폼을 통해 발송되었습니다.
        `.trim();

        const mailtoUrl = `mailto:researcherhojin@gmail.com?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;

        // 폼 초기화
        setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            inquiryType: 'solution',
            message: '',
        });

        alert('메일 앱이 열렸습니다. 메일을 확인하고 전송해주세요.');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <>
            <SEOHelmet 
                title="문의하기"
                description="AI 프로젝트 및 교육 관련 문의를 남겨주세요. 에멜무지로가 최적의 AI 솔루션을 제공합니다."
                keywords="AI 컨설팅 문의, 에멜무지로 연락처, AI 교육 문의, 기업 AI 도입 상담"
                url="https://researcherhojin.github.io/emelmujiro/#/contact"
            />
            <div className="min-h-screen bg-white">

            {/* Header */}
            <div className="border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-lg font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        돌아가기
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-5xl font-bold text-gray-900">문의하기</h1>
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            isOnline ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                            {isOnline ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
                            {isOnline ? '온라인' : '오프라인'}
                        </div>
                    </div>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        AI 솔루션, 컨설팅, 교육 문의에 대한 궁금한 점이 있으시면 언제든지 연락주세요.
                    </p>
                </div>
                
                {/* Offline message */}
                {showOfflineMessage && (
                    <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                            <strong>오프라인 모드:</strong> 문의가 저장되었습니다. 인터넷 연결이 복구되면 자동으로 전송됩니다.
                        </p>
                    </div>
                )}

                {/* Inquiry Types */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                            <Code className="w-5 h-5 text-gray-700 mr-3" />
                            <h3 className="text-xl font-bold text-gray-900">AI 솔루션 & 컨설팅</h3>
                        </div>
                        <ul className="text-base text-gray-700 space-y-2 leading-relaxed">
                            <li>• 맞춤형 AI 솔루션 개발</li>
                            <li>• AI 도입 전략 컨설팅</li>
                            <li>• 데이터 분석 및 파이프라인 구축</li>
                            <li>• LLM 기반 솔루션</li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                            <BookOpen className="w-5 h-5 text-gray-700 mr-3" />
                            <h3 className="text-xl font-bold text-gray-900">교육 & 강의</h3>
                        </div>
                        <ul className="text-base text-gray-700 space-y-2 leading-relaxed">
                            <li>• 기업 맞춤형 AI 교육</li>
                            <li>• 딥러닝 & 머신러닝 강의</li>
                            <li>• LLM & ChatGPT 활용 교육</li>
                            <li>• 데이터 분석 실무 교육</li>
                        </ul>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-10 mb-16 shadow-xl relative overflow-hidden">
                    <div className="mb-8 sm:mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">문의 내용 작성</h2>
                        <div className="w-16 h-1 bg-gray-900 rounded-full"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Inquiry Type Selection */}
                        <div>
                            <label className="block text-base font-semibold text-gray-700 mb-4">문의 유형 *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="relative">
                                    <input
                                        type="radio"
                                        name="inquiryType"
                                        value="solution"
                                        checked={formData.inquiryType === 'solution'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                                            formData.inquiryType === 'solution'
                                                ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                                                : 'border-gray-200 hover:border-gray-400 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <Code className={`w-6 h-6 mr-3 transition-colors ${
                                                formData.inquiryType === 'solution' ? 'text-white' : 'text-gray-700'
                                            }`} />
                                            <span className={`font-semibold text-lg ${
                                                formData.inquiryType === 'solution' ? 'text-white' : 'text-gray-900'
                                            }`}>AI 솔루션 & 컨설팅</span>
                                        </div>
                                    </div>
                                </label>

                                <label className="relative">
                                    <input
                                        type="radio"
                                        name="inquiryType"
                                        value="education"
                                        checked={formData.inquiryType === 'education'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                                            formData.inquiryType === 'education'
                                                ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                                                : 'border-gray-200 hover:border-gray-400 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <BookOpen className={`w-6 h-6 mr-3 transition-colors ${
                                                formData.inquiryType === 'education' ? 'text-white' : 'text-gray-700'
                                            }`} />
                                            <span className={`font-semibold text-lg ${
                                                formData.inquiryType === 'education' ? 'text-white' : 'text-gray-900'
                                            }`}>교육 & 강의</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-2">
                                    이름 *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all hover:border-gray-300"
                                    placeholder="홍길동"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    이메일 *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all hover:border-gray-300"
                                    placeholder="hong@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    전화번호
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all hover:border-gray-300"
                                    placeholder="010-1234-5678"
                                />
                            </div>
                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                                    회사명/기관명
                                </label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all hover:border-gray-300"
                                    placeholder="회사명 또는 기관명"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                문의 내용 *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={6}
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors resize-none"
                                placeholder={
                                    formData.inquiryType === 'education'
                                        ? '교육 대상, 예상 인원, 교육 기간, 원하는 커리큘럼 등을 포함하여 상세히 작성해주세요...'
                                        : '프로젝트 목표, 예산 규모, 일정 등을 포함하여 상세히 작성해주세요...'
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center px-8 py-5 bg-gray-900 text-white text-lg font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 group"
                        >
                            문의 보내기
                            <Send className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">연락처 정보</h2>
                        <div className="w-16 h-1 bg-gray-900 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                            <div className="flex items-center mb-2">
                                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                <span className="text-sm sm:text-base font-medium text-gray-600">이메일</span>
                            </div>
                            <p className="text-lg sm:text-xl text-gray-900 ml-8 font-medium">researcherhojin@gmail.com</p>
                        </div>

                        <div>
                            <div className="flex items-center mb-2">
                                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                <span className="text-sm sm:text-base font-medium text-gray-600">전화</span>
                            </div>
                            <p className="text-lg sm:text-xl text-gray-900 ml-8 font-medium">010-7279-0380</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-base text-gray-600">
                            일반적으로 24시간 이내에 답변드립니다. 급한 문의는 전화로 연락주세요.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ContactPage;
