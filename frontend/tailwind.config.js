// Tailwind 3.4.19 palette for the families this site uses. Tailwind 4 ships
// an OKLCH palette whose values differ slightly; pinning these keeps colors
// identical to the v3 site (including @tailwindcss/typography's prose-gray).
const v3Colors = {
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },
};

// @tailwindcss/typography reads tailwindcss/colors directly, so the pin above
// does not reach it; these are the prose color variables of the v3 build.
const v3ProseColors = {
  '--tw-prose-body': '#374151',
  '--tw-prose-headings': '#111827',
  '--tw-prose-lead': '#4b5563',
  '--tw-prose-links': '#111827',
  '--tw-prose-bold': '#111827',
  '--tw-prose-counters': '#6b7280',
  '--tw-prose-bullets': '#d1d5db',
  '--tw-prose-hr': '#e5e7eb',
  '--tw-prose-quotes': '#111827',
  '--tw-prose-quote-borders': '#e5e7eb',
  '--tw-prose-captions': '#6b7280',
  '--tw-prose-kbd': '#111827',
  '--tw-prose-kbd-shadows': '#1118271a',
  '--tw-prose-code': '#111827',
  '--tw-prose-pre-code': '#e5e7eb',
  '--tw-prose-pre-bg': '#1f2937',
  '--tw-prose-th-borders': '#d1d5db',
  '--tw-prose-td-borders': '#e5e7eb',
  '--tw-prose-invert-body': '#d1d5db',
  '--tw-prose-invert-headings': '#fff',
  '--tw-prose-invert-lead': '#9ca3af',
  '--tw-prose-invert-links': '#fff',
  '--tw-prose-invert-bold': '#fff',
  '--tw-prose-invert-counters': '#9ca3af',
  '--tw-prose-invert-bullets': '#4b5563',
  '--tw-prose-invert-hr': '#374151',
  '--tw-prose-invert-quotes': '#f3f4f6',
  '--tw-prose-invert-quote-borders': '#374151',
  '--tw-prose-invert-captions': '#9ca3af',
  '--tw-prose-invert-kbd': '#fff',
  '--tw-prose-invert-kbd-shadows': '#ffffff1a',
  '--tw-prose-invert-code': '#fff',
  '--tw-prose-invert-pre-code': '#d1d5db',
  '--tw-prose-invert-pre-bg': '#00000080',
  '--tw-prose-invert-th-borders': '#4b5563',
  '--tw-prose-invert-td-borders': '#374151',
};

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
      typography: {
        DEFAULT: { css: v3ProseColors },
        gray: { css: v3ProseColors },
      },
      colors: {
        ...v3Colors,
        // Simplified dark palette (zinc). 600 and 700 back the dark-mode borders
        // and hover in Navbar, Footer, ServiceModal and DarkModeToggle, whose
        // classes emitted no CSS until these keys existed.
        dark: {
          600: '#52525b',
          700: '#3f3f46',
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
