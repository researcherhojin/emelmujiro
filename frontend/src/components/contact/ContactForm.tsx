import React, { memo, ChangeEvent } from 'react';
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
    return (
      <form
        onSubmit={onSubmit}
        className="space-y-6"
        noValidate
        aria-label="문의 양식"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="홍길동"
              aria-required="true"
              aria-label="이름 입력"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              이메일 <span className="text-red-500">*</span>
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
              aria-label="이메일 입력"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              전화번호
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="010-1234-5678"
              aria-label="전화번호 입력"
            />
          </div>

          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              회사/기관명
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={onInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="에멜무지로"
              aria-label="회사/기관명 입력"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="inquiryType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            문의 유형 <span className="text-red-500">*</span>
          </label>
          <select
            id="inquiryType"
            name="inquiryType"
            value={formData.inquiryType}
            onChange={onInputChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            aria-required="true"
            aria-label="문의 유형 선택"
          >
            <option value="consulting">AI 컨설팅</option>
            <option value="education">기업 AI 교육</option>
            <option value="llm">LLM 솔루션</option>
            <option value="data">데이터 분석</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            문의 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={onInputChange}
            required
            rows={6}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-400 dark:focus:border-gray-500 transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="문의하실 내용을 자유롭게 작성해주세요."
            aria-required="true"
            aria-label="문의 내용 입력"
          />
        </div>

        {!isOnline && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">오프라인 모드</span>
            </div>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              현재 오프라인 상태입니다. 문의는 저장되어 인터넷 연결 시 자동으로
              전송됩니다.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          aria-label="문의 전송"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-gray-900" />
              <span>전송 중...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>문의 전송</span>
            </>
          )}
        </button>
      </form>
    );
  }
);

ContactForm.displayName = 'ContactForm';

export default ContactForm;
