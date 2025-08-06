import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PARTNER_COMPANIES } from '../../constants';

interface Company {
  name: string;
  logo: string;
  description?: string;
}

interface LogoItemProps {
  company: Company;
  index: number;
}

const LogoItem: React.FC<LogoItemProps> = memo(({ company, index }) => (
  <div
    key={index}
    className="flex-shrink-0 px-8"
  >
    <div className="flex flex-col items-center justify-center w-32 h-32">
      <img
        src={company.logo}
        alt={`${company.name} 로고 - ${company.description || 'AI 파트너 기업'}`}
        className="h-16 w-auto object-contain mb-2 hover:scale-110 transition-transform duration-300"
        loading="lazy"
      />
      <span className="text-sm text-gray-600 text-center whitespace-nowrap">
        {company.name}
      </span>
    </div>
  </div>
));

LogoItem.displayName = 'LogoItem';

const LogosSection: React.FC = memo(() => {
  const partnerCompanies = PARTNER_COMPANIES;

  // Memoize the row splitting logic
  const { duplicatedFirstRow, duplicatedSecondRow } = useMemo(() => {
    const halfLength = Math.ceil(partnerCompanies.length / 2);
    const firstRow = partnerCompanies.slice(0, halfLength);
    const secondRow = partnerCompanies.slice(halfLength);
    
    // Duplicate for infinite scrolling
    return {
      duplicatedFirstRow: [...firstRow, ...firstRow],
      duplicatedSecondRow: [...secondRow, ...secondRow]
    };
  }, [partnerCompanies]);

  return (
    <section id="partners" className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            함께한 기업 및 기관
          </h2>
          <p className="text-lg text-gray-600">
            다양한 분야의 선도 기업들과 AI 프로젝트를 진행했습니다
          </p>
        </motion.div>
      </div>

      {/* Infinite sliding container */}
      <div className="relative space-y-8">
        {/* First row */}
        <div className="relative">
          <div className="flex animate-scroll hover:pause">
            {duplicatedFirstRow.map((company, index) => (
              <LogoItem 
                key={`row1-${index}`} 
                company={company} 
                index={index} 
              />
            ))}
          </div>
        </div>
        
        {/* Second row - reverse animation */}
        <div className="relative">
          <div className="flex animate-scroll-reverse hover:pause">
            {duplicatedSecondRow.map((company, index) => (
              <LogoItem 
                key={`row2-${index}`} 
                company={company} 
                index={index} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

LogosSection.displayName = 'LogosSection';

export default LogosSection;