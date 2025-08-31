import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface BaseButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  loading?: boolean;
}

interface LinkButtonProps extends BaseButtonProps {
  to: string;
  onClick?: never;
  disabled?: never;
  href?: never;
}

interface ExternalLinkProps extends BaseButtonProps {
  href: string;
  to?: never;
  onClick?: never;
  disabled?: never;
}

interface ButtonElementProps
  extends BaseButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
  to?: never;
  href?: never;
}

type ButtonProps = LinkButtonProps | ExternalLinkProps | ButtonElementProps;

// Move static data outside component to avoid recreating
const VARIANTS = {
  primary:
    'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 focus:ring-gray-900 dark:focus:ring-gray-100',
  secondary:
    'bg-white dark:bg-dark-800 border-2 border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 hover:border-gray-400 dark:hover:border-dark-500',
  outline:
    'bg-transparent border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900',
  ghost:
    'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800',
  danger:
    'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 focus:ring-red-600 dark:focus:ring-red-500',
};

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const Button: React.FC<ButtonProps> = memo((props) => {
  const {
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    icon,
    iconPosition = 'right',
    className = '',
    loading = false,
  } = props;

  // Memoize class computation
  const baseClasses = useMemo(() => {
    return [
      'inline-flex items-center justify-center',
      'font-semibold rounded-lg',
      'transition-all duration-200',
      'shadow-md hover:shadow-lg',
      'hover:scale-105 active:scale-100',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
      fullWidth ? 'w-full' : '',
      VARIANTS[variant],
      SIZES[size],
      loading ? 'cursor-wait' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
  }, [variant, size, fullWidth, className, loading]);

  // Memoize icon rendering
  const iconElement = useMemo(() => {
    if (!icon && !loading) return null;

    if (loading) {
      return (
        <span className={iconPosition === 'left' ? 'mr-2' : 'ml-2'}>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      );
    }

    return (
      <span className={iconPosition === 'left' ? 'mr-2' : 'ml-2'}>{icon}</span>
    );
  }, [icon, loading, iconPosition]);

  // Memoize content rendering
  const content = useMemo(
    () => (
      <>
        {iconPosition === 'left' && iconElement}
        {!loading && children}
        {loading && <span>Loading...</span>}
        {iconPosition === 'right' && iconElement}
      </>
    ),
    [children, iconElement, iconPosition, loading]
  );

  // Link 컴포넌트로 렌더링
  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={baseClasses}>
        {content}
      </Link>
    );
  }

  // 외부 링크로 렌더링
  if ('href' in props && props.href) {
    return (
      <a
        href={props.href}
        className={baseClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  // 일반 버튼으로 렌더링
  const {
    onClick,
    disabled = false,
    to: _to,
    href: _href,
    fullWidth: _,
    iconPosition: __,
    className: ___,
    variant: ____,
    size: _____,
    icon: ______,
    children: _______,
    ...buttonProps
  } = props as ButtonElementProps;
  return (
    <button
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      {...buttonProps}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
