import React, { memo, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CTASection: React.FC = memo(() => {
  const handleEmailClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Track email click event for analytics (if needed)
    // Future: Add analytics tracking here
  }, []);

  return (
    <section className="py-24 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            프로젝트를 시작할 준비가 되셨나요?
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            AI 전문가와 함께 귀사의 비즈니스 문제를 해결하세요.
          </p>

          <div className="flex justify-center">
            <motion.a
              href="mailto:researcherhojin@gmail.com"
              onClick={handleEmailClick}
              className="inline-flex items-center px-8 py-4 bg-black text-white 
                font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="이메일로 문의하기"
            >
              이메일로 문의하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

export default CTASection;