import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const PWAInstallButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // PWA 설치 여부 확인
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsInstalled(true);
            return;
        }

        // beforeinstallprompt 이벤트 리스너
        const handleBeforeInstallPrompt = (e) => {
            // 기본 브라우저 설치 프롬프트 방지
            e.preventDefault();
            // 나중에 사용하기 위해 이벤트 저장
            setDeferredPrompt(e);
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
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // 설치 프롬프트 표시
        deferredPrompt.prompt();

        // 사용자의 선택 대기
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('사용자가 PWA 설치를 수락했습니다');
        } else {
            console.log('사용자가 PWA 설치를 거부했습니다');
        }

        // 프롬프트는 한 번만 사용할 수 있으므로 초기화
        setDeferredPrompt(null);
        setShowInstallButton(false);
    };

    // 이미 설치되었거나 설치 버튼을 표시하지 않는 경우
    if (isInstalled || !showInstallButton) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
            <button
                onClick={handleInstallClick}
                className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg 
                    hover:bg-gray-800 transition-all duration-200 flex items-center gap-2
                    hover:scale-105 active:scale-95"
                aria-label="앱 설치하기"
            >
                <Download className="w-5 h-5" />
                <span className="font-medium">앱 설치하기</span>
            </button>
        </div>
    );
};

export default PWAInstallButton;