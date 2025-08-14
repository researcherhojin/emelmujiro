import React, { useState, useEffect, memo, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface AppUpdateNotificationProps {
  registration?: ServiceWorkerRegistration;
}

const AppUpdateNotification: React.FC<AppUpdateNotificationProps> = memo(
  ({ registration }) => {
    const [showUpdate, setShowUpdate] = useState<boolean>(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
      null
    );

    useEffect(() => {
      if (!registration) return;

      // Check if there's already a waiting service worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdate(true);
      }

      // Listen for new service worker
      const handleUpdateFound = () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(newWorker);
            setShowUpdate(true);
          }
        });
      };

      registration.addEventListener('updatefound', handleUpdateFound);

      return () => {
        registration.removeEventListener('updatefound', handleUpdateFound);
      };
    }, [registration]);

    const handleUpdate = useCallback(() => {
      if (!waitingWorker) return;

      // Tell the waiting service worker to activate
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      // Listen for the controlling service worker to change
      const handleControllerChange = () => {
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener(
        'controllerchange',
        handleControllerChange
      );

      // Clean up if the user doesn't update
      return () => {
        navigator.serviceWorker.removeEventListener(
          'controllerchange',
          handleControllerChange
        );
      };
    }, [waitingWorker]);

    const handleDismiss = useCallback(() => {
      setShowUpdate(false);
      // Show again after 1 hour
      setTimeout(() => {
        if (waitingWorker) {
          setShowUpdate(true);
        }
      }, 3600000);
    }, [waitingWorker]);

    if (!showUpdate) {
      return null;
    }

    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-in">
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                새로운 버전이 있습니다
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                앱을 최신 버전으로 업데이트하여 새로운 기능과 개선사항을
                경험하세요.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white
                          text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                  aria-label="지금 업데이트"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  지금 업데이트
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-gray-600 text-xs font-medium
                          hover:text-gray-900 transition-colors"
                  aria-label="나중에"
                >
                  나중에
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

AppUpdateNotification.displayName = 'AppUpdateNotification';

export default AppUpdateNotification;
