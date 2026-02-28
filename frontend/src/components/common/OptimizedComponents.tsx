import React, { memo, useMemo, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Collection of performance-optimized common components using React.memo
 */

// Button Component with memo
interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

export const OptimizedButton = memo<ButtonProps>(
  ({
    onClick,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    type = 'button',
    ariaLabel,
  }) => {
    const buttonClasses = useMemo(() => {
      const baseClasses =
        'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';

      const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary:
          'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        outline:
          'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      };

      const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      };

      return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
    }, [variant, size, className]);

    const handleClick = useCallback(() => {
      if (!disabled && !loading && onClick) {
        onClick();
      }
    }, [disabled, loading, onClick]);

    return (
      <button
        type={type}
        onClick={handleClick}
        disabled={disabled || loading}
        className={buttonClasses}
        aria-label={ariaLabel}
        aria-busy={loading}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        )}
        {children}
      </button>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.onClick === nextProps.onClick &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.loading === nextProps.loading &&
      prevProps.variant === nextProps.variant &&
      prevProps.size === nextProps.size &&
      prevProps.children === nextProps.children &&
      prevProps.className === nextProps.className
    );
  }
);

OptimizedButton.displayName = 'OptimizedButton';

// Card Component with memo
interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export const OptimizedCard = memo<CardProps>(
  ({ title, description, image, onClick, className = '', children }) => {
    const cardClasses = useMemo(
      () =>
        `bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${className}`,
      [className]
    );

    const handleClick = useCallback(() => {
      if (onClick) {
        onClick();
      }
    }, [onClick]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          handleClick();
        }
      },
      [onClick, handleClick]
    );

    return (
      <motion.div
        className={cardClasses}
        onClick={handleClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {image && (
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={image}
              alt={title || 'Card image'}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6">
          {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
          {description && <p className="text-gray-600 mb-4">{description}</p>}
          {children}
        </div>
      </motion.div>
    );
  }
);

OptimizedCard.displayName = 'OptimizedCard';

// List Item Component with memo
interface ListItemProps {
  id: string | number;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClick?: (id: string | number) => void;
  selected?: boolean;
}

export const OptimizedListItem = memo<ListItemProps>(
  ({ id, title, subtitle, icon, onClick, selected = false }) => {
    const handleClick = useCallback(() => {
      if (onClick) {
        onClick(id);
      }
    }, [id, onClick]);

    const itemClasses = useMemo(
      () => `
        flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors
        ${selected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
      `,
      [selected]
    );

    return (
      <div
        className={itemClasses}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-selected={selected}
      >
        {icon && <div className="mr-4 flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.subtitle === nextProps.subtitle &&
      prevProps.selected === nextProps.selected &&
      prevProps.onClick === nextProps.onClick
    );
  }
);

OptimizedListItem.displayName = 'OptimizedListItem';

// Input Component with memo
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export const OptimizedInput = memo<InputProps>(
  ({
    value,
    onChange,
    placeholder,
    type = 'text',
    disabled = false,
    error,
    label,
    required = false,
    className = '',
  }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange]
    );

    const inputClasses = useMemo(
      () => `
        w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        ${className}
      `,
      [error, disabled, className]
    );

    const inputId = useMemo(
      () => `input-${Math.random().toString(36).substring(2, 11)}`,
      []
    );

    return (
      <div className="mb-4">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.onChange === nextProps.onChange &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.error === nextProps.error &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.type === nextProps.type
    );
  }
);

OptimizedInput.displayName = 'OptimizedInput';

// Badge Component with memo
interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export const OptimizedBadge = memo<BadgeProps>(
  ({ text, variant = 'primary', size = 'md' }) => {
    const badgeClasses = useMemo(() => {
      const baseClasses = 'inline-flex items-center font-medium rounded-full';

      const variantClasses = {
        primary: 'bg-blue-100 text-blue-800',
        secondary: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
      };

      const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
      };

      return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
    }, [variant, size]);

    return <span className={badgeClasses}>{text}</span>;
  }
);

OptimizedBadge.displayName = 'OptimizedBadge';

export default {
  Button: OptimizedButton,
  Card: OptimizedCard,
  ListItem: OptimizedListItem,
  Input: OptimizedInput,
  Badge: OptimizedBadge,
};
