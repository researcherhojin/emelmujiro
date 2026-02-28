import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowRight, Mail } from 'lucide-react';
import SEOHelmet from '../common/SEOHelmet';
import { CONTACT_EMAIL } from '../../utils/constants';

const ContactPage: React.FC = memo(() => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHelmet
        title="문의하기 | 에멜무지로"
        description="에멜무지로의 AI 컨설팅, 기업 교육, LLM 솔루션 등에 대해 문의하세요."
        url="https://researcherhojin.github.io/emelmujiro/contact"
      />

      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Construction className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 animate-pulse" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6">
            문의 기능 준비 중
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            온라인 문의 양식을 준비하고 있습니다
          </p>

          <p className="text-base text-gray-500 dark:text-gray-500 mb-8">
            아래 이메일로 직접 문의해주시면 빠르게 답변드리겠습니다.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all rounded-xl mb-12"
          >
            <Mail className="w-5 h-5 mr-3" />
            {CONTACT_EMAIL}
          </a>

          <div className="block">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-8 py-4 text-base font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all rounded-xl"
            >
              메인으로 돌아가기
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

ContactPage.displayName = 'ContactPage';

export default ContactPage;
