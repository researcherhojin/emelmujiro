import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Share2, MessageCircle, Mail, ExternalLink } from 'lucide-react';

interface SharedContent {
  title?: string;
  text?: string;
  url?: string;
}

const SharePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sharedContent, setSharedContent] = useState<SharedContent>({});
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Parse shared content from URL parameters
    const searchParams = new URLSearchParams(location.search);
    
    const content: SharedContent = {
      title: searchParams.get('title') || '',
      text: searchParams.get('text') || '',
      url: searchParams.get('url') || '',
    };

    setSharedContent(content);
    setIsProcessing(false);
  }, [location.search]);

  const handleSendInquiry = () => {
    // Navigate to contact page with pre-filled content
    const message = `
안녕하세요, 다음 내용에 대해 문의드립니다:

제목: ${sharedContent.title || ''}
내용: ${sharedContent.text || ''}
링크: ${sharedContent.url || ''}

관련하여 상담을 받고 싶습니다.
    `.trim();

    navigate('/contact', { 
      state: { 
        prefilledMessage: message,
        subject: sharedContent.title || '공유된 콘텐츠 문의'
      } 
    });
  };

  const handleViewContent = () => {
    if (sharedContent.url) {
      window.open(sharedContent.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveForLater = () => {
    // Save to local storage or favorites
    const savedItems = JSON.parse(localStorage.getItem('saved-content') || '[]');
    const newItem = {
      ...sharedContent,
      savedAt: new Date().toISOString(),
      id: Date.now().toString(),
    };
    
    savedItems.unshift(newItem);
    localStorage.setItem('saved-content', JSON.stringify(savedItems.slice(0, 50))); // Keep only 50 items
    
    // Show success message and redirect
    alert('콘텐츠가 저장되었습니다!');
    navigate('/');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">공유된 콘텐츠를 처리하는 중...</p>
        </div>
      </div>
    );
  }

  const hasContent = sharedContent.title || sharedContent.text || sharedContent.url;

  if (!hasContent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            공유할 콘텐츠가 없습니다
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            다른 앱에서 콘텐츠를 공유하여 이 페이지를 사용할 수 있습니다.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            콘텐츠 공유
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            공유된 콘텐츠를 어떻게 활용하시겠습니까?
          </p>
        </div>

        {/* Shared Content Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            공유된 콘텐츠
          </h2>
          
          {sharedContent.title && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
                {sharedContent.title}
              </p>
            </div>
          )}
          
          {sharedContent.text && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                내용
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded whitespace-pre-wrap">
                {sharedContent.text}
              </p>
            </div>
          )}
          
          {sharedContent.url && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                링크
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <a
                  href={sharedContent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {sharedContent.url}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={handleSendInquiry}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium 
                       transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>문의하기</span>
          </button>
          
          {sharedContent.url && (
            <button
              onClick={handleViewContent}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium 
                         transition-colors flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span>원본 보기</span>
            </button>
          )}
          
          <button
            onClick={handleSaveForLater}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-medium 
                       transition-colors flex items-center justify-center space-x-2"
          >
            <Mail className="w-5 h-5" />
            <span>나중에 보기</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg font-medium 
                       transition-colors flex items-center justify-center space-x-2"
          >
            <span>홈으로 이동</span>
          </button>
        </div>

        {/* Additional Options */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            다른 옵션이 필요하시나요?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/blog')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              블로그 둘러보기
            </button>
            <button
              onClick={() => navigate('/about')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              회사 소개
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              직접 문의하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;