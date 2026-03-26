import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Quote, ExternalLink } from 'lucide-react';

interface Testimonial {
  text: string;
  program: string;
  rating: number;
}

const getTestimonials = (
  t: (key: string) => string
): { cv: Testimonial[]; startup: Testimonial[] } => ({
  cv: [
    {
      text: t('testimonials.cv1'),
      program: t('testimonials.cvProgram'),
      rating: 5,
    },
    {
      text: t('testimonials.cv2'),
      program: t('testimonials.cvProgram'),
      rating: 5,
    },
    {
      text: t('testimonials.cv3'),
      program: t('testimonials.cvProgram'),
      rating: 5,
    },
    {
      text: t('testimonials.cv4'),
      program: t('testimonials.cvProgram'),
      rating: 5,
    },
  ],
  startup: [
    {
      text: t('testimonials.startup1'),
      program: t('testimonials.startupProgram'),
      rating: 5,
    },
    {
      text: t('testimonials.startup2'),
      program: t('testimonials.startupProgram'),
      rating: 5,
    },
    {
      text: t('testimonials.startup3'),
      program: t('testimonials.startupProgram'),
      rating: 5,
    },
    {
      text: t('testimonials.startup4'),
      program: t('testimonials.startupProgram'),
      rating: 5,
    },
  ],
});

const StarRating: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = memo(({ testimonial }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
    <Quote className="w-8 h-8 text-gray-200 dark:text-gray-700 mb-4" aria-hidden="true" />
    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-4">
      {testimonial.text}
    </p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 dark:text-gray-400">{testimonial.program}</span>
      <StarRating count={testimonial.rating} />
    </div>
  </div>
));

TestimonialCard.displayName = 'TestimonialCard';

const TestimonialsSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const { cv, startup } = getTestimonials(t);
  const allTestimonials = [...cv, ...startup];

  return (
    <section
      className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900"
      aria-label={t('testimonials.sectionLabel')}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-3">
            {t('testimonials.subtitle')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">
            {t('testimonials.title')}
          </h2>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                4.8<span className="text-lg text-gray-400">/5</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('testimonials.cvProgram')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                100<span className="text-lg text-gray-400">%</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('testimonials.recommendRate')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                4.3<span className="text-lg text-gray-400">/5</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('testimonials.startupProgram')}
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allTestimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Source */}
        <div className="text-center mt-8">
          <a
            href="https://www.hrd.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
            {t('testimonials.source')}
          </a>
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';

export default TestimonialsSection;
