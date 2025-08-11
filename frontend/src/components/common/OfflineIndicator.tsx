import React, { useState, useEffect, memo } from 'react';
import { WifiOff, Wifi, AlertCircle, RefreshCw } from 'lucide-react';

interface OfflineIndicatorState {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  pendingRequests: number;
}

const OfflineIndicator: React.FC = memo(() => {
  const [state, setState] = useState<OfflineIndicatorState>({
    isOnline: navigator.onLine,
    syncStatus: 'idle',
    pendingRequests: 0,
  });
  const [showIndicator, setShowIndicator] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true, syncStatus: 'syncing' }));
      setShowIndicator(true);
      
      // Simulate sync process
      setTimeout(() => {
        setState(prev => ({ ...prev, syncStatus: 'success', pendingRequests: 0 }));
        setTimeout(() => {
          setState(prev => ({ ...prev, syncStatus: 'idle' }));
          setShowIndicator(false);
        }, 2000);
      }, 1500);
    };

    const handleOffline = () => {
      setState(prev => ({ 
        ...prev, 
        isOnline: false, 
        syncStatus: 'idle',
        pendingRequests: prev.pendingRequests + 1 
      }));
      setShowIndicator(true);
    };

    // Service worker message handler for enhanced sync status
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const { type, data } = event.data || {};
      
      switch (type) {
        case 'NETWORK_STATUS':
          if (data?.online) {
            handleOnline();
          } else {
            handleOffline();
          }
          break;
        case 'SYNC_STATUS':
          setState(prev => ({ 
            ...prev, 
            syncStatus: data?.status || 'idle',
            pendingRequests: data?.pendingCount || 0 
          }));
          break;
        case 'BACKGROUND_SYNC_COMPLETE':
          setState(prev => ({ 
            ...prev, 
            syncStatus: 'success',
            pendingRequests: Math.max(0, prev.pendingRequests - 1)
          }));
          setTimeout(() => {
            setState(prev => ({ ...prev, syncStatus: 'idle' }));
          }, 2000);
          break;
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen to service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Check initial state
    if (!navigator.onLine) {
      setState(prev => ({ ...prev, isOnline: false }));
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowIndicator(false);
  };

  const getIndicatorContent = () => {
    const { isOnline, syncStatus, pendingRequests } = state;

    if (!isOnline) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        title: '오프라인 상태',
        message: pendingRequests > 0 
          ? `${pendingRequests}개 요청이 대기 중입니다` 
          : '일부 기능이 제한될 수 있습니다',
        bgColor: 'bg-red-500',
        showActions: true,
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          title: '동기화 중',
          message: '데이터를 업데이트하고 있습니다...',
          bgColor: 'bg-blue-500',
          showActions: false,
        };
      case 'success':
        return {
          icon: <Wifi className="w-4 h-4" />,
          title: '온라인 연결됨',
          message: '모든 기능을 사용할 수 있습니다',
          bgColor: 'bg-green-500',
          showActions: false,
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          title: '동기화 오류',
          message: '일부 데이터 동기화에 실패했습니다',
          bgColor: 'bg-orange-500',
          showActions: true,
        };
      default:
        return null;
    }
  };

  if (!showIndicator) {
    return null;
  }

  const content = getIndicatorContent();
  if (!content) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${content.bgColor} text-white rounded-lg shadow-lg 
                  p-4 max-w-sm transition-all duration-300 animate-fade-in`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {content.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{content.title}</div>
          <div className="text-xs opacity-90 mt-1">{content.message}</div>
          
          {/* Progress bar for syncing */}
          {state.syncStatus === 'syncing' && (
            <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000 animate-pulse" 
                   style={{ width: '75%' }} />
            </div>
          )}
        </div>
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          aria-label="알림 닫기"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Action buttons */}
      {content.showActions && (
        <div className="mt-3 pt-3 border-t border-white/20 flex space-x-2">
          <button
            onClick={handleRetry}
            className="flex-1 bg-white/10 hover:bg-white/20 text-xs py-2 px-3 rounded 
                       transition-colors duration-200 font-medium"
            aria-label="연결 상태 다시 확인"
          >
            다시 시도
          </button>
          {!state.isOnline && (
            <button
              onClick={() => setShowIndicator(false)}
              className="bg-white/10 hover:bg-white/20 text-xs py-2 px-3 rounded 
                         transition-colors duration-200"
              aria-label="알림 숨기기"
            >
              숨기기
            </button>
          )}
        </div>
      )}
    </div>
  );
});

OfflineIndicator.displayName = 'OfflineIndicator';

export default OfflineIndicator;
