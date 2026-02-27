import React, { useState, useEffect, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import logger from '../../utils/logger';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallButton: React.FC = memo(() => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if window and matchMedia are available (for test environment)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    // PWA 설치 여부 확인
    try {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone
      ) {
        setIsInstalled(true);
        return;
      }
    } catch (error) {
      // matchMedia may not work in some test environments
      // Silently fail in test environments
      if (process.env.NODE_ENV !== 'test') {
        logger.warn('matchMedia not available:', error);
      }
      return;
    }

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      // 기본 브라우저 설치 프롬프트 방지
      e.preventDefault();
      // 나중에 사용하기 위해 이벤트 저장
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // 설치 버튼 표시
      setShowInstallButton(true);
    };

    // appinstalled 이벤트 리스너
    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    // 설치 프롬프트 표시
    deferredPrompt.prompt();

    // 사용자의 선택 대기
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      // User accepted PWA installation
    } else {
      // User dismissed PWA installation
    }

    // 프롬프트는 한 번만 사용할 수 있으므로 초기화
    setDeferredPrompt(null);
    setShowInstallButton(false);
  }, [deferredPrompt]);

  // 이미 설치되었거나 설치 버튼을 표시하지 않는 경우
  if (isInstalled || !showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 animate-fade-in">
      <button
        onClick={handleInstallClick}
        className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg
                    hover:bg-gray-800 transition-all duration-200 flex items-center gap-2
                    hover:scale-105 active:scale-95"
        aria-label={t('pwa.installApp')}
      >
        <Download className="w-5 h-5" />
        <span className="font-medium">{t('pwa.installApp')}</span>
      </button>
    </div>
  );
});

PWAInstallButton.displayName = 'PWAInstallButton';

export default PWAInstallButton;
