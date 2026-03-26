import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => (
  <div
    className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}
    role="alert"
  >
    {type === 'success' ? (
      <CheckCircle className="w-5 h-5" />
    ) : (
      <AlertTriangle className="w-5 h-5" />
    )}
    <span>{message}</span>
  </div>
);

export default Toast;
