import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = memo(() => {
    const navigate = useNavigate();

    const handleGoHome = useCallback(() => {
        navigate('/');
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
            <p className="text-gray-600 mb-8">페이지를 찾을 수 없습니다.</p>
            <button
                onClick={handleGoHome}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
                홈으로 이동
            </button>
        </div>
    );
});

NotFound.displayName = 'NotFound';

export default NotFound;