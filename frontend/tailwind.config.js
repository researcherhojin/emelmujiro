/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
    // Exclude test files — they can reference class-looking words in comments
    // or string literals (e.g. "lowercase kebab-case") that make Tailwind
    // emit unused utilities into the production bundle.
    '!./src/**/__tests__/**',
    '!./src/**/__mocks__/**',
    '!./src/**/*.test.{js,jsx,ts,tsx}',
    '!./src/setupTests.ts',
    '!./src/test-utils/**',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Minimal color system - black, white, grays
      colors: {
        // Simplified dark palette
        dark: {
          800: '#27272a',
          850: '#1f2022',
          900: '#18181b',
          950: '#0a0a0b',
        },
        // Minimal primary color
        primary: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      // Scroll animations for logos and testimonials, plus CSS replacements
      // for framer-motion entrance/loading animations (see UnifiedLoading.tsx
      // and BlogCard.tsx). Keeping these as Tailwind utilities means the
      // whole framer-motion runtime is no longer shipped.
      animation: {
        scroll: 'scroll 32s linear infinite',
        'scroll-reverse': 'scroll-reverse 32s linear infinite',
        'scroll-testimonial': 'scroll-testimonial 32s linear infinite',
        'scroll-testimonial-reverse': 'scroll-testimonial-reverse 32s linear infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'fade-up-sm': 'fade-up-sm 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'fade-up-delay': 'fade-up-delay 0.4s ease-out 0.2s forwards',
        'dot-bounce': 'dot-bounce 0.6s ease-in-out infinite',
        'scale-pulse': 'scale-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        // Carousel keyframes use translateX(-50%) because LogosSection and
        // TestimonialsSection now render 2 copies of their content (was 3x
        // and 5x respectively; reduced to drop homepage dom-size below the
        // Lighthouse 800-node threshold). Math: with N copies the animation
        // must move -((1/N) × 100%) to loop seamlessly — 2 copies = -50%.
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scroll-testimonial': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-testimonial-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        // BlogCard featured (y:20 → 0, 0.6s) mount entrance
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // BlogCard compact (y:16 → 0, 0.5s) mount entrance
        'fade-up-sm': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // UnifiedLoading spinner message (y:10 → 0, 0.2s delay)
        'fade-up-delay': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // UnifiedLoading dots variant — stagger via inline animationDelay
        'dot-bounce': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(-10px)', opacity: '0.5' },
        },
        // UnifiedLoading pulse variant
        'scale-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.5' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
