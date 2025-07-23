import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </React.StrictMode>
);

// PWA로 작동하도록 서비스 워커 등록
serviceWorkerRegistration.register({
    onUpdate: (registration) => {
        // 새 버전이 있을 때 사용자에게 알림
        if (window.confirm('새로운 버전이 있습니다. 페이지를 새로고침하시겠습니까?')) {
            window.location.reload();
        }
    },
    onSuccess: (registration) => {
        console.log('PWA 오프라인 모드 준비 완료');
    }
});
