import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Mail,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ServerError: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // 재시도 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 실제로는 여기서 API 재호출 등을 수행
    if (retryCount < 2) {
      // 재시도 실패 시뮬레이션
      setIsRetrying(false);
    } else {
      // 3번째 시도에서는 성공으로 가정하고 리로드
      window.location.reload();
    }
  };

  const statusMessages = [
    { code: 500, message: t('serverError.status.500') },
    { code: 502, message: t('serverError.status.502') },
    { code: 503, message: t('serverError.status.503') },
    { code: 504, message: t('serverError.status.504') },
  ];

  const currentStatus =
    statusMessages[Math.min(retryCount, statusMessages.length - 1)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20"
        >
          {/* 상태 인디케이터 */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{
                scale: isRetrying ? [1, 1.2, 1] : 1,
                rotate: isRetrying ? 360 : 0,
              }}
              transition={{
                duration: isRetrying ? 2 : 0.5,
                repeat: isRetrying ? Infinity : 0,
              }}
              className="relative"
            >
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
              {!isOnline && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <WifiOff className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          </div>

          {/* 에러 코드 */}
          <motion.div
            key={currentStatus.code}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-6"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white/90 mb-2">
              {currentStatus.code}
            </h1>
            <p className="text-xl text-white/70">{currentStatus.message}</p>
          </motion.div>

          {/* 상태 메시지 */}
          <div className="mb-8">
            {!isOnline && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 mb-4"
              >
                <div className="flex items-center gap-3">
                  <WifiOff className="w-5 h-5 text-orange-400" />
                  <p className="text-orange-200">
                    {t('serverError.offlineMessage')}
                  </p>
                </div>
              </motion.div>
            )}

            <p className="text-white/60 text-center">
              {isRetrying ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t('serverError.retrying', { count: retryCount })}
                </span>
              ) : (
                t('serverError.temporaryIssue')
              )}
            </p>

            {retryCount > 0 && !isRetrying && (
              <p className="text-red-400 text-sm text-center mt-2">
                {t('serverError.retryFailed', { count: retryCount })}
              </p>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`
                flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all
                ${
                  isRetrying
                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                }
              `}
            >
              <RefreshCw
                className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`}
              />
              {isRetrying
                ? t('serverError.retryingButton')
                : t('serverError.retry')}
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all border border-white/20"
            >
              <Home className="w-5 h-5" />
              {t('common.home')}
            </button>

            <a
              href={`mailto:${process.env.REACT_APP_SUPPORT_EMAIL || 'support@emelmujiro.com'}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all border border-white/20"
            >
              <Mail className="w-5 h-5" />
              {t('serverError.contactSupport')}
            </a>
          </div>

          {/* 추가 정보 */}
          <div className="border-t border-white/10 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-white/40">
                <p>
                  {t('serverError.statusCode')} {currentStatus.code}
                </p>
                <p>
                  {t('serverError.time')}{' '}
                  {new Date().toLocaleTimeString(
                    i18n.language === 'ko' ? 'ko-KR' : 'en-US'
                  )}
                </p>
              </div>
              <div className="text-white/40 text-right">
                <p className="flex items-center justify-end gap-2">
                  {t('serverError.network')}{' '}
                  {isOnline ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">
                        {t('serverError.connected')}
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">
                        {t('serverError.disconnected')}
                      </span>
                    </>
                  )}
                </p>
                <p>
                  {t('serverError.retryLabel')} {retryCount}/3
                </p>
              </div>
            </div>

            {/* 상태 진행 바 */}
            <div className="mt-4">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-blue-400"
                  initial={{ width: '0%' }}
                  animate={{ width: isRetrying ? '100%' : '0%' }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 도움말 텍스트 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-white/40 text-sm"
        >
          <p>{t('serverError.helpText')}</p>
          <ul className="mt-2 space-y-1">
            <li>• {t('serverError.helpTip1')}</li>
            <li>• {t('serverError.helpTip2')}</li>
            <li>• {t('serverError.helpTip3')}</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default ServerError;
