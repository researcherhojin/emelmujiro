import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

const LogoItem: React.FC<LogoItemProps> = memo(({ company, index }) => {
  const { t } = useTranslation();
  return (
    <div key={index} className="flex-shrink-0 px-8">
      <div className="flex items-center justify-center w-40 h-24 group">
        <img
          src={company.logo}
          alt={t('logos.logoAlt', { name: company.name })}
          className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
          loading="lazy"
        />
      </div>
    </div>
  );
});

LogoItem.displayName = 'LogoItem';

const LogosSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const partnerCompanies = PARTNER_COMPANIES;

  // Memoize the row splitting logic
  const { duplicatedFirstRow, duplicatedSecondRow } = useMemo(() => {
    const halfLength = Math.ceil(partnerCompanies.length / 2);
    const firstRow = partnerCompanies.slice(0, halfLength);
    const secondRow = partnerCompanies.slice(halfLength);

    // Duplicate for infinite scrolling
    return {
      duplicatedFirstRow: [...firstRow, ...firstRow],
      duplicatedSecondRow: [...secondRow, ...secondRow],
    };
  }, [partnerCompanies]);

  return (
    <section
      id="partners"
      className="py-32 bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-4">
            {t('logos.sectionLabel')}
          </h2>
          <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
            {t('logos.title')}
          </h3>
        </div>
      </div>

      {/* Infinite sliding container */}
      <div className="relative space-y-8">
        {/* First row */}
        <div className="relative">
          <div className="flex animate-scroll hover:pause">
            {duplicatedFirstRow.map((company, index) => (
              <LogoItem key={`row1-${index}`} company={company} index={index} />
            ))}
          </div>
        </div>

        {/* Second row - reverse animation */}
        <div className="relative">
          <div className="flex animate-scroll-reverse hover:pause">
            {duplicatedSecondRow.map((company, index) => (
              <LogoItem key={`row2-${index}`} company={company} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

LogosSection.displayName = 'LogosSection';

export default LogosSection;
