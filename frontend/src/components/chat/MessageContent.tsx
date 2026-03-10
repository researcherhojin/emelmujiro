import React, { useMemo, useEffect } from 'react';
import { Download, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MessageContentProps {
  type: string;
  content: string;
  file?: File | { url: string; size?: number };
  onFileDownload: (file: File | { url: string } | undefined, filename: string) => void;
  onImagePreview: (file: File | { url: string } | undefined, filename: string) => void;
}

const MessageContent: React.FC<MessageContentProps> = ({
  type,
  content,
  file,
  onFileDownload,
  onImagePreview,
}) => {
  const { t } = useTranslation();

  const imageObjectUrl = useMemo(
    () => (type === 'image' && file instanceof File ? URL.createObjectURL(file) : null),
    [type, file]
  );

  useEffect(() => {
    return () => {
      if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
    };
  }, [imageObjectUrl]);

  switch (type) {
    case 'text':
      return <div className="whitespace-pre-wrap break-words">{content}</div>;

    case 'image':
      return (
        <div className="space-y-2">
          <button
            className="cursor-pointer relative group rounded-lg overflow-hidden max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => onImagePreview(file, content)}
            type="button"
            aria-label={`Preview image: ${content}`}
          >
            {imageObjectUrl ? (
              <img
                src={imageObjectUrl}
                alt={content}
                className="w-full h-auto max-h-48 object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                <Eye className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
          <button
            onClick={() => onFileDownload(file, content)}
            className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Download className="w-4 h-4" />
            <span>{content}</span>
          </button>
        </div>
      );

    case 'file':
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-w-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{content}</div>
              {file?.size && (
                <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
              )}
            </div>
            <button
              onClick={() => onFileDownload(file, content)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              aria-label={t('chat.downloadFile')}
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      );

    case 'system':
      return <div className="text-center text-gray-600 dark:text-gray-400 italic">{content}</div>;

    default:
      return <div>{content}</div>;
  }
};

export default MessageContent;
