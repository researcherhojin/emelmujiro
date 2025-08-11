import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  File,
  X,
  CheckCircle,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../contexts/UIContext';

interface FileUploadProps {
  onUpload: (file: File) => void;
  onClose?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, onClose }) => {
  const { t } = useTranslation();
  const { showNotification } = useUI();
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/zip',
    'video/mp4',
    'audio/mpeg',
  ];

  const getFileIcon = (file: File) => {
    const type = file.type;

    if (type.startsWith('image/')) return FileImage;
    if (type.startsWith('video/')) return FileVideo;
    if (type.startsWith('audio/')) return FileAudio;
    if (type === 'application/pdf' || type.includes('document')) return FileText;

    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return t('chat.fileUpload.invalidType', '지원하지 않는 파일 형식입니다.');
    }

    if (file.size > maxFileSize) {
      return t(
        'chat.fileUpload.fileTooLarge',
        `파일 크기가 너무 큽니다. (최대 ${formatFileSize(maxFileSize)})`
      );
    }

    return null;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const error = validateFile(file);
    if (error) {
      showNotification('error', error);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 0;
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // Wait for "upload" to complete
      await new Promise(resolve => setTimeout(resolve, 1200));

      onUpload(selectedFile);
      setSelectedFile(null);
      setUploadProgress(null);

      showNotification(
        'success',
        t('chat.fileUpload.success', '파일이 성공적으로 업로드되었습니다.')
      );

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(null);
      showNotification('error', t('chat.fileUpload.failed', '파일 업로드에 실패했습니다.'));
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUploadProgress(null);
    if (onClose) {
      onClose();
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute bottom-full left-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 mb-2 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('chat.fileUpload.title', '파일 업로드')}
        </h3>
        <button
          onClick={handleCancel}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('common.close', '닫기')}
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Upload Area */}
      {!selectedFile && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrowseClick();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-all
            ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {isDragActive
              ? t('chat.fileUpload.dropHere', '여기에 파일을 놓아주세요')
              : t('chat.fileUpload.dragDrop', '파일을 끌어다 놓거나')}
          </p>
          <button
            onClick={handleBrowseClick}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('chat.fileUpload.browse', '파일 선택')}
          </button>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && uploadProgress === null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              {React.createElement(getFileIcon(selectedFile), {
                className: 'w-5 h-5 text-blue-500',
              })}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label={t('common.remove', '제거')}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleUpload}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-lg transition-colors"
            >
              {t('chat.fileUpload.upload', '업로드')}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {t('common.cancel', '취소')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              {uploadProgress === 100 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Upload className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {uploadProgress === 100
                  ? t('chat.fileUpload.completed', '업로드 완료')
                  : t('chat.fileUpload.uploading', '업로드 중...')}
              </p>
              <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* File Type Info */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {t('chat.fileUpload.allowedTypes', '지원 파일 형식:')}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          {t('chat.fileUpload.formats', '이미지, PDF, 문서, 동영상, 음성파일')} (최대{' '}
          {formatFileSize(maxFileSize)})
        </p>
      </div>

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={allowedTypes.join(',')}
        className="hidden"
      />
    </motion.div>
  );
};

export default FileUpload;
