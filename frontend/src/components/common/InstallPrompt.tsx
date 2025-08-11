import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ 
  onInstall, 
  onDismiss, 
  className = '' 
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setDeviceType(isMobile ? 'mobile' : 'desktop');

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      
      // Check if user has dismissed the prompt recently
      const dismissed = localStorage.getItem('install-prompt-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show prompt if not dismissed recently or if it's been more than 7 days
      if (!dismissed || daysSinceDismissed > 7) {
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsVisible(false);
      setDeferredPrompt(null);
      
      if (onInstall) {
        onInstall();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
        setIsVisible(false);
        if (onInstall) {
          onInstall();
        }
      } else {
        console.log('User dismissed the A2HS prompt');
        handleDismiss();
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    setIsVisible(false);
    
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleRemindLater = () => {
    // Set reminder for 24 hours later
    const reminderTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('install-prompt-dismissed', reminderTime.toString());
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  const deviceIcon = deviceType === 'mobile' ? 
    <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" /> : 
    <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />;

  const deviceText = deviceType === 'mobile' ? '홈 화면' : '데스크톱';

  return (
    <div className={`fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl 
                     p-6 max-w-sm border border-gray-200 dark:border-gray-700 
                     animate-slide-up ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            {deviceIcon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              앱 설치하기
            </h3>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
            에멜무지로를 {deviceText}에 설치하여 더 빠르고 편리하게 이용하세요. 
            오프라인에서도 사용할 수 있습니다.
          </p>
          
          {/* Benefits list */}
          <div className="mb-4">
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>빠른 실행</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>오프라인 사용</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span>푸시 알림</span>
              </li>
            </ul>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                         text-white py-2 px-3 rounded text-xs font-medium 
                         transition-colors duration-200 disabled:cursor-not-allowed
                         flex items-center justify-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>{isInstalling ? '설치 중...' : '설치'}</span>
            </button>
            
            <button
              onClick={handleRemindLater}
              className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300 
                         hover:text-gray-800 dark:hover:text-gray-100
                         transition-colors duration-200"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;