/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Dark mode color palette
      colors: {
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        primary: {
          light: '#3b82f6',
          dark: '#60a5fa',
        },
        secondary: {
          light: '#6b7280',
          dark: '#9ca3af',
        },
        accent: {
          light: '#f59e0b',
          dark: '#fbbf24',
        },
      },
      // 필요한 경우 커스텀 테마 추가
      animation: {
        slide: 'slide 30s linear infinite',
        scroll: 'scroll 40s linear infinite',
        'scroll-reverse': 'scroll-reverse 40s linear infinite',
        'theme-transition': 'theme-transition 0.3s ease-in-out',
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'theme-transition': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionProperty: {
        theme:
          'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      },
    },
  },
  plugins: [],
};
