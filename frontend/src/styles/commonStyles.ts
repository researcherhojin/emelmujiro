/**
 * 공통 스타일 클래스 정의
 * Tailwind CSS 클래스를 재사용 가능한 상수로 관리
 */

// Layout 스타일
export const layout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerSmall: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-16 md:py-20',
  sectionSmall: 'py-8 md:py-12',
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  grid2: 'grid md:grid-cols-2 gap-8',
  grid3: 'grid md:grid-cols-3 gap-8',
  grid4: 'grid md:grid-cols-4 gap-6',
} as const;

// Typography 스타일
export const typography = {
  // Headings
  h1: 'text-4xl md:text-5xl font-bold text-gray-900',
  h2: 'text-3xl md:text-4xl font-bold text-gray-900',
  h3: 'text-2xl md:text-3xl font-bold text-gray-900',
  h4: 'text-xl md:text-2xl font-semibold text-gray-900',
  h5: 'text-lg md:text-xl font-semibold text-gray-800',
  h6: 'text-base md:text-lg font-semibold text-gray-800',

  // Body text
  body: 'text-base text-gray-600 leading-relaxed',
  bodyLarge: 'text-lg text-gray-600 leading-relaxed',
  bodySmall: 'text-sm text-gray-600',

  // Special text
  lead: 'text-xl text-gray-700 leading-relaxed',
  caption: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700',
  error: 'text-sm text-red-600',
  success: 'text-sm text-green-600',
} as const;

// Button 스타일
export const buttons = {
  base: 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',

  // Variants
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',

  // Sizes
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',

  // States
  disabled: 'opacity-50 cursor-not-allowed',
  loading: 'cursor-wait',
  fullWidth: 'w-full',
} as const;

// Form 스타일
export const forms = {
  // Input base
  input:
    'block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors',
  inputError: 'border-red-500 focus:ring-red-500',
  inputSuccess: 'border-green-500 focus:ring-green-500',

  // Textarea
  textarea:
    'block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none',

  // Select
  select:
    'block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white',

  // Checkbox & Radio
  checkbox: 'h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded',
  radio: 'h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300',

  // Label
  label: 'block text-sm font-medium text-gray-700 mb-1',
  labelRequired: 'after:content-["*"] after:ml-0.5 after:text-red-500',

  // Helper text
  helperText: 'mt-1 text-sm text-gray-500',
  errorText: 'mt-1 text-sm text-red-600',

  // Form group
  formGroup: 'mb-4',
  formRow: 'grid grid-cols-1 md:grid-cols-2 gap-4',
} as const;

// Card 스타일
export const cards = {
  base: 'bg-white rounded-lg shadow-md overflow-hidden',
  bordered: 'bg-white rounded-lg border border-gray-200',
  elevated: 'bg-white rounded-lg shadow-lg',
  interactive: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer',

  // Padding variants
  noPadding: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',

  // Special cards
  gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg p-6',
  dark: 'bg-gray-900 text-white rounded-lg p-6',
} as const;

// Animation 스타일
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scaleIn: 'animate-scale-in',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',

  // Transition
  transition: 'transition-all duration-300 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  transitionSlow: 'transition-all duration-500 ease-in-out',
} as const;

// Spacing 스타일
export const spacing = {
  // Margin
  marginSection: 'mt-16 md:mt-20',
  marginElement: 'mt-8 md:mt-12',
  marginSmall: 'mt-4 md:mt-6',

  // Padding
  paddingSection: 'pt-16 pb-16 md:pt-20 md:pb-20',
  paddingElement: 'p-6 md:p-8',
  paddingSmall: 'p-4',

  // Gap
  gapLarge: 'gap-8 md:gap-12',
  gapMedium: 'gap-4 md:gap-6',
  gapSmall: 'gap-2',
} as const;

// 색상 스타일
export const colors = {
  // Text colors
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-400',
  textInverse: 'text-white',

  // Background colors
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-gray-50',
  bgDark: 'bg-gray-900',
  bgAccent: 'bg-indigo-600',

  // Border colors
  borderDefault: 'border-gray-200',
  borderDark: 'border-gray-300',
  borderLight: 'border-gray-100',
} as const;

// 상태별 스타일
export const states = {
  hover: 'hover:shadow-lg hover:scale-105',
  focus: 'focus:outline-none focus:ring-2 focus:ring-indigo-500',
  active: 'active:scale-95',
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  loading: 'animate-pulse pointer-events-none',
  error: 'border-red-500 text-red-600',
  success: 'border-green-500 text-green-600',
  warning: 'border-yellow-500 text-yellow-600',
} as const;

// 유틸리티 함수: 클래스 조합
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// 컴포넌트별 프리셋
export const presets = {
  // Page container
  pageContainer: cn(layout.container, spacing.paddingSection),

  // Section heading
  sectionHeading: cn(typography.h2, 'text-center mb-12'),

  // Form input with label
  formField: cn(forms.formGroup),

  // Primary button
  primaryButton: cn(buttons.base, buttons.primary, buttons.md),

  // Card with hover effect
  interactiveCard: cn(cards.interactive, cards.md),

  // Error message
  errorMessage: cn(typography.error, 'mt-2'),

  // Success message
  successMessage: cn(typography.success, 'mt-2'),
} as const;

export default {
  layout,
  typography,
  buttons,
  forms,
  cards,
  animations,
  spacing,
  colors,
  states,
  presets,
  cn,
};
