import React, { memo, ReactNode } from 'react';
import {
  AlertTriangle,
  XCircle,
  Info,
  CheckCircle,
  LucideIcon,
} from 'lucide-react';

type MessageType = 'error' | 'warning' | 'info' | 'success';

interface ErrorMessageProps {
  type?: MessageType;
  title?: string;
  message?: string;
  onClose?: () => void;
  action?: ReactNode;
  className?: string;
}

interface TypeConfig {
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  icon: LucideIcon;
}

const ErrorMessage: React.FC<ErrorMessageProps> = memo(
  ({ type = 'error', title, message, onClose, action, className = '' }) => {
    const types: Record<MessageType, TypeConfig> = {
      error: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-400',
        icon: XCircle,
      },
      warning: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-400',
        icon: AlertTriangle,
      },
      info: {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-400',
        icon: Info,
      },
      success: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-400',
        icon: CheckCircle,
      },
    };

    const config = types[type];
    const Icon = config.icon;

    return (
      <div
        className={`
            ${config.bgColor}
            ${config.borderColor}
            ${config.textColor}
            border rounded-lg p-4
            ${className}
        `}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="ml-3 flex-1">
            {title && <h3 className="text-sm font-medium">{title}</h3>}
            {message && (
              <p className={`text-sm ${title ? 'mt-1' : ''}`}>{message}</p>
            )}
            {action && <div className="mt-3">{action}</div>}
          </div>
          {onClose && (
            <div className="ml-auto pl-3">
              <button
                onClick={onClose}
                className={`inline-flex rounded-md ${config.bgColor} p-1.5 ${config.textColor} hover:${config.bgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : type === 'info' ? 'blue' : 'green'}-50 focus:ring-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : type === 'info' ? 'blue' : 'green'}-600`}
              >
                <span className="sr-only">닫기</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
