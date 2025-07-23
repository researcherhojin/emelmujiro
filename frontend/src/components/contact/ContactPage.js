import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Info, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import SEO from '../layout/SEO';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        inquiry_type: 'general',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

    const inquiryTypes = [
        { value: 'lecture', label: '강의 문의', description: 'AI/ML 교육 및 강의 관련 문의' },
        { value: 'consulting', label: '컨설팅 문의', description: 'AI 도입 및 기술 컨설팅' },
        { value: 'collaboration', label: '협업 제안', description: '프로젝트 협업 및 파트너십' },
        { value: 'media', label: '미디어/인터뷰 문의', description: '언론 인터뷰 및 미디어 관련' },
        { value: 'general', label: '일반 문의', description: '기타 일반적인 문의사항' },
    ];

    // 실시간 입력 검증
    const validateField = useCallback((name, value) => {
        const errors = {};

        switch (name) {
            case 'name':
                if (value.length < 2) {
                    errors.name = '이름은 최소 2자 이상이어야 합니다.';
                } else if (!/^[a-zA-Z가-힣\s]+$/.test(value)) {
                    errors.name = '이름에는 한글, 영문, 공백만 사용할 수 있습니다.';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors.email = '올바른 이메일 주소를 입력해주세요.';
                }
                break;

            case 'phone':
                if (
                    value &&
                    !/^(01[016789]|02|0[3-9][0-9]?)[-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$/.test(value.replace(/\s/g, ''))
                ) {
                    errors.phone = '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)';
                }
                break;

            case 'subject':
                if (value.length < 5) {
                    errors.subject = '제목은 최소 5자 이상이어야 합니다.';
                } else if (value.length > 200) {
                    errors.subject = '제목은 200자를 초과할 수 없습니다.';
                }
                break;

            case 'message':
                if (value.length < 10) {
                    errors.message = '문의 내용은 최소 10자 이상이어야 합니다.';
                } else if (value.length > 2000) {
                    errors.message = '문의 내용은 2000자를 초과할 수 없습니다.';
                }
                break;

            default:
                break;
        }

        return errors;
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // 실시간 검증
        const fieldErrors = validateField(name, value);
        setValidationErrors((prev) => ({
            ...prev,
            [name]: fieldErrors[name] || null,
        }));

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // reCAPTCHA 시뮬레이션 (실제 구현 시 Google reCAPTCHA 사용)
    const handleRecaptchaVerify = () => {
        setIsRecaptchaVerified(true);
        setTimeout(() => {
            setResponseMessage({
                type: 'info',
                text: '보안 인증이 완료되었습니다.',
            });
        }, 1000);
    };

    const validateForm = () => {
        const errors = {};

        // 모든 필드 검증
        Object.keys(formData).forEach((key) => {
            if (['name', 'email', 'subject', 'message'].includes(key)) {
                const fieldErrors = validateField(key, formData[key]);
                if (fieldErrors[key]) {
                    errors[key] = fieldErrors[key];
                }
            }
        });

        // 필수 필드 체크
        if (!formData.name.trim()) errors.name = '이름을 입력해주세요.';
        if (!formData.email.trim()) errors.email = '이메일을 입력해주세요.';
        if (!formData.subject.trim()) errors.subject = '제목을 입력해주세요.';
        if (!formData.message.trim()) errors.message = '문의 내용을 입력해주세요.';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setResponseMessage({
                type: 'error',
                text: '입력 정보를 다시 확인해주세요.',
            });
            return;
        }

        if (!isRecaptchaVerified) {
            setResponseMessage({
                type: 'error',
                text: '보안 인증을 완료해주세요.',
            });
            return;
        }

        setIsSubmitting(true);
        setResponseMessage(null);

        try {
            const submitData = {
                ...formData,
                recaptcha_token: 'simulated_token', // 실제로는 reCAPTCHA 토큰
            };

            const response = await api.createContact(submitData);
            setResponseMessage({
                type: 'success',
                text: response.data.message || '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
            });

            // 폼 초기화
            setFormData({
                name: '',
                email: '',
                company: '',
                phone: '',
                inquiry_type: 'general',
                subject: '',
                message: '',
            });
            setValidationErrors({});
            setIsRecaptchaVerified(false);

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('문의 전송 실패:', error);

            let errorMessage = '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

            if (error.response?.status === 429) {
                errorMessage = '너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해주세요.';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.error || '입력 정보가 올바르지 않습니다.';
            }

            setResponseMessage({
                type: 'error',
                text: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <SEO
                title="AI 도입 상담 | 에멜무지로"
                description="실무 중심의 AI 교육 및 도입 상담을 제공합니다. 기업의 디지털 혁신을 위한 첫걸음을 함께하세요."
                keywords="AI 도입 상담, AI 교육, 기업 AI 컨설팅, 머신러닝 교육"
            />
            <div className="min-h-screen bg-gray-50 flex items-center relative overflow-hidden">
                {/* Background decorative elements - consistent with other pages */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gray-200 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gray-200 rounded-full opacity-20 blur-3xl"></div>
                </div>
                <div className="w-full py-24 bg-white relative z-10">
                    <div className="max-w-4xl mx-auto px-4">
                        {/* Title Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-12"
                        >
                            <h1 className="text-4xl font-bold mb-4 text-gray-900">
                                AI 도입 상담
                            </h1>
                            <p className="text-lg text-gray-600">실무 중심의 AI 교육과 기술 도입을 도와드립니다</p>

                            {/* 보안 안내 */}
                            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
                                <Shield className="w-4 h-4" />
                                <span>모든 문의 정보는 안전하게 보호됩니다</span>
                            </div>
                        </motion.div>

                        {/* Form Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                                <div className="p-8 md:p-10">
                                    {responseMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                                                responseMessage.type === 'success'
                                                    ? 'bg-green-50 text-green-700'
                                                    : responseMessage.type === 'info'
                                                    ? 'bg-gray-50 text-gray-700'
                                                    : 'bg-red-50 text-red-700'
                                            }`}
                                        >
                                            {responseMessage.type === 'success' ? (
                                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            ) : responseMessage.type === 'error' ? (
                                                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            )}
                                            <p>{responseMessage.text}</p>
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* 문의 유형 선택 */}
                                        <div>
                                            <label className="block mb-3 text-sm font-medium text-gray-700">
                                                문의 유형 <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                {inquiryTypes.map((type) => (
                                                    <label
                                                        key={type.value}
                                                        className={`cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 ${
                                                            formData.inquiry_type === type.value
                                                                ? 'border-gray-700 bg-gray-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="inquiry_type"
                                                            value={type.value}
                                                            checked={formData.inquiry_type === type.value}
                                                            onChange={handleChange}
                                                            className="sr-only"
                                                        />
                                                        <div className="font-medium text-gray-900 mb-1">
                                                            {type.label}
                                                        </div>
                                                        <div className="text-sm text-gray-600">{type.description}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                                    이름 <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                                                        validationErrors.name ? 'border-red-300' : 'border-gray-200'
                                                    }`}
                                                    placeholder="홍길동"
                                                />
                                                {validationErrors.name && (
                                                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                                    회사명
                                                </label>
                                                <input
                                                    type="text"
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="회사명을 입력해주세요"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                                    이메일 <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                                                        validationErrors.email ? 'border-red-300' : 'border-gray-200'
                                                    }`}
                                                    placeholder="example@domain.com"
                                                />
                                                {validationErrors.email && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {validationErrors.email}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                                    연락처
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                                                        validationErrors.phone ? 'border-red-300' : 'border-gray-200'
                                                    }`}
                                                    placeholder="010-1234-5678"
                                                />
                                                {validationErrors.phone && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {validationErrors.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                문의 제목 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                                                    validationErrors.subject ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                                placeholder="문의 제목을 입력해주세요"
                                            />
                                            {validationErrors.subject && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors.subject}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                문의 내용 <span className="text-red-500">*</span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    ({formData.message.length}/2000)
                                                </span>
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows="6"
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                                                    validationErrors.message ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                                placeholder="문의하실 내용을 자세히 적어주세요"
                                            />
                                            {validationErrors.message && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors.message}</p>
                                            )}
                                        </div>

                                        {/* reCAPTCHA 시뮬레이션 */}
                                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="recaptcha"
                                                            checked={isRecaptchaVerified}
                                                            onChange={handleRecaptchaVerify}
                                                            className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-900"
                                                        />
                                                        <label
                                                            htmlFor="recaptcha"
                                                            className="ml-2 text-sm text-gray-700"
                                                        >
                                                            저는 로봇이 아닙니다
                                                        </label>
                                                    </div>
                                                    {isRecaptchaVerified && (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">reCAPTCHA</div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !isRecaptchaVerified}
                                            className={`w-full py-4 px-6 text-white bg-gray-900 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2 ${
                                                isSubmitting || !isRecaptchaVerified
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : ''
                                            }`}
                                        >
                                            <Send className="w-5 h-5" />
                                            <span>{isSubmitting ? '전송 중...' : '문의하기'}</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>

                        {/* 개인정보 처리 방침 안내 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="mt-8 text-center text-sm text-gray-500"
                        >
                            <p>
                                문의 시 제공해주신 개인정보는 문의 응답 목적으로만 사용되며, 관련 법령에 따라 안전하게
                                보관됩니다.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactPage;
