import React, { memo, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, ExternalLink } from 'lucide-react';

interface Testimonial {
  text: string;
  program: string;
}

const getTestimonials = (
  t: (key: string) => string
): { enterprise: Testimonial[]; government: Testimonial[] } => ({
  enterprise: [
    { text: t('testimonials.enterprise1'), program: t('testimonials.enterprise1Source') },
    { text: t('testimonials.enterprise2'), program: t('testimonials.enterprise2Source') },
    { text: t('testimonials.enterprise3'), program: t('testimonials.enterprise3Source') },
    { text: t('testimonials.enterprise4'), program: t('testimonials.enterprise4Source') },
    { text: t('testimonials.enterprise5'), program: t('testimonials.enterprise5Source') },
    { text: t('testimonials.enterprise6'), program: t('testimonials.enterprise6Source') },
    { text: t('testimonials.enterprise7'), program: t('testimonials.enterprise7Source') },
    { text: t('testimonials.enterprise8'), program: t('testimonials.enterprise8Source') },
  ],
  government: [
    { text: t('testimonials.cv1'), program: t('testimonials.cvProgram') },
    { text: t('testimonials.cv2'), program: t('testimonials.cvProgram') },
    { text: t('testimonials.startup1'), program: t('testimonials.startupProgram') },
    { text: t('testimonials.startup2'), program: t('testimonials.startupProgram') },
    { text: t('testimonials.cv3'), program: t('testimonials.cvProgram') },
    { text: t('testimonials.startup3'), program: t('testimonials.startupProgram') },
    { text: t('testimonials.cv4'), program: t('testimonials.cvProgram') },
    { text: t('testimonials.startup4'), program: t('testimonials.startupProgram') },
  ],
});

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = memo(({ testimonial }) => (
  <div className="flex-shrink-0 w-72 h-48 mx-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
    <Quote
      className="w-5 h-5 text-gray-300 dark:text-gray-600 mb-2 flex-shrink-0"
      aria-hidden="true"
    />
    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1 line-clamp-4">
      {testimonial.text}
    </p>
    <span className="text-xs text-gray-600 dark:text-gray-300 mt-3 flex-shrink-0">
      {testimonial.program}
    </span>
  </div>
));

TestimonialCard.displayName = 'TestimonialCard';

interface ScrollRowProps {
  testimonials: Testimonial[];
  direction?: 'left' | 'right';
  rowKey: string;
}

const ScrollRow: React.FC<ScrollRowProps> = memo(({ testimonials, direction = 'left', rowKey }) => {
  const animationClass =
    direction === 'left' ? 'animate-scroll-testimonial' : 'animate-scroll-testimonial-reverse';
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(() => {
    scrollRef.current?.style.setProperty('animation-play-state', 'paused');
  }, []);

  const handleTouchEnd = useCallback(() => {
    scrollRef.current?.style.setProperty('animation-play-state', 'running');
  }, []);

  return (
    <div className="relative overflow-hidden group">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 dark:from-gray-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 dark:from-gray-950 to-transparent z-10" />

      <div
        ref={scrollRef}
        className={`flex w-max ${animationClass} group-hover:pause`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {[0, 1, 2, 3, 4].map((copy) =>
          testimonials.map((testimonial, index) => (
            <TestimonialCard key={`${rowKey}-${copy}-${index}`} testimonial={testimonial} />
          ))
        )}
      </div>
    </div>
  );
});

ScrollRow.displayName = 'ScrollRow';

const TestimonialsSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const { enterprise, government } = useMemo(() => getTestimonials(t), [t]);

  return (
    <section
      className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden"
      aria-label={t('testimonials.sectionLabel')}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-2 sm:mb-3">
            {t('testimonials.subtitle')}
          </p>
          <h2 className="text-2xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white">
            {t('testimonials.title')}
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        <ScrollRow testimonials={enterprise} direction="left" rowKey="enterprise" />
        <ScrollRow testimonials={government} direction="right" rowKey="government" />
      </div>

      <div className="text-center mt-8 space-x-4">
        <a
          href="https://www.hrd.go.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
          {t('testimonials.source')}
        </a>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';

export default TestimonialsSection;
