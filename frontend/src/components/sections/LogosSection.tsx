import React, { memo, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PARTNER_COMPANIES, type PartnerCompany } from '../../constants';

const LogoItem: React.FC<{ company: PartnerCompany }> = memo(({ company }) => {
  const { t } = useTranslation();
  return (
    <div className="flex-shrink-0 px-8">
      <div className="flex items-center justify-center w-40 h-24">
        <img
          src={company.logo}
          alt={t('logos.logoAlt', { name: company.name })}
          className="h-12 w-auto object-contain opacity-60 group-hover:opacity-40 hover:!opacity-100 transition-opacity duration-300"
          width={160}
          height={48}
          loading="eager"
        />
      </div>
    </div>
  );
});

LogoItem.displayName = 'LogoItem';

interface ScrollRowProps {
  companies: PartnerCompany[];
  direction?: 'left' | 'right';
  rowKey: string;
}

const ScrollRow: React.FC<ScrollRowProps> = memo(({ companies, direction = 'left', rowKey }) => {
  const animationClass = direction === 'left' ? 'animate-scroll' : 'animate-scroll-reverse';
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(() => {
    scrollRef.current?.style.setProperty('animation-play-state', 'paused');
  }, []);

  const handleTouchEnd = useCallback(() => {
    scrollRef.current?.style.setProperty('animation-play-state', 'running');
  }, []);

  return (
    <div className="relative overflow-hidden group">
      {/* Left/right fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 dark:from-gray-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 dark:from-gray-950 to-transparent z-10" />

      <div
        ref={scrollRef}
        className={`flex w-max ${animationClass} group-hover:pause`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render 3 copies for seamless looping */}
        {[0, 1, 2].map((copy) =>
          companies.map((company, index) => (
            <LogoItem key={`${rowKey}-${copy}-${index}`} company={company} />
          ))
        )}
      </div>
    </div>
  );
});

ScrollRow.displayName = 'ScrollRow';

const LogosSection: React.FC = memo(() => {
  const { t } = useTranslation();

  const { firstRow, secondRow } = useMemo(() => {
    const half = Math.ceil(PARTNER_COMPANIES.length / 2);
    return {
      firstRow: PARTNER_COMPANIES.slice(0, half),
      secondRow: PARTNER_COMPANIES.slice(half),
    };
  }, []);

  return (
    <section
      id="partners"
      className="py-16 sm:py-32 bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 sm:mb-20 text-center">
          <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-3 sm:mb-4 block">
            {t('logos.sectionLabel')}
          </span>
          <h2 className="text-2xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6">
            {t('logos.title')}
          </h2>
        </div>
      </div>

      <div className="space-y-8">
        <ScrollRow companies={firstRow} direction="left" rowKey="row1" />
        <ScrollRow companies={secondRow} direction="right" rowKey="row2" />
      </div>
    </section>
  );
});

LogosSection.displayName = 'LogosSection';

export default LogosSection;
