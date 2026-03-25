import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Share2, Bookmark, Link2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlogPost } from '../../types';
import { api } from '../../services/api';
import logger from '../../utils/logger';

interface BlogInteractionsProps {
  post: BlogPost;
}

const BlogInteractions: React.FC<BlogInteractionsProps> = ({ post }) => {
  const { t } = useTranslation();
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Cleanup copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Load bookmark state from localStorage
  useEffect(() => {
    try {
      const bookmarksData = localStorage.getItem('bookmarks');
      const bookmarks: Array<{ id: string | number }> = bookmarksData
        ? JSON.parse(bookmarksData)
        : [];
      setIsBookmarked(bookmarks.some((b) => b.id === post.id));
    } catch (error) {
      logger.error('Failed to load bookmarks:', error);
      setIsBookmarked(false);
    }
  }, [post.id]);

  // Toggle like via API
  const toggleLike = useCallback(async () => {
    try {
      const response = await api.likeBlogPost(post.id);
      setLikes(response.data.likes);
      setIsLiked(response.data.liked);
    } catch (error) {
      logger.error('Failed to toggle like:', error);
    }
  }, [post.id]);

  // Toggle bookmark
  const toggleBookmark = () => {
    try {
      const bookmarksData = localStorage.getItem('bookmarks');
      const bookmarks: Array<{
        id: string | number;
        title: string;
        excerpt: string;
        date?: string;
        savedAt: string;
      }> = bookmarksData ? JSON.parse(bookmarksData) : [];

      if (isBookmarked) {
        // Remove bookmark
        const filtered = bookmarks.filter((b) => b.id !== post.id);
        localStorage.setItem('bookmarks', JSON.stringify(filtered));
      } else {
        // Add bookmark
        const bookmark = {
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.title,
          date: post.date,
          savedAt: new Date().toISOString(),
        };
        bookmarks.unshift(bookmark);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      }

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      logger.error('Failed to toggle bookmark:', error);
    }
  };

  // Share functions
  const shareUrl = window.location.href;
  const shareTitle = post.title;
  const shareText = post.excerpt;

  const shareToKakao = () => {
    // Note: Kakao SDK would need to be initialized in index.html
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(kakaoUrl, '_blank', 'noopener,noreferrer,width=500,height=600');
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=500,height=600');
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=500,height=600');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=500,height=600');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      copyTimerRef.current = setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      logger.warn('Clipboard API not available');
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error - silently handle
      }
    } else {
      setShowShareMenu(true);
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-y border-gray-200 dark:border-gray-700 my-8">
      <div className="flex items-center space-x-4">
        {/* Like button */}
        <button
          onClick={toggleLike}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isLiked
              ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="font-medium">{likes}</span>
        </button>

        {/* Bookmark button */}
        <button
          onClick={toggleBookmark}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isBookmarked
              ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Share button */}
      <div className="relative">
        <button
          onClick={nativeShare}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">{t('blog.share')}</span>
        </button>

        {/* Share menu */}
        {showShareMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowShareMenu(false)}
              onKeyDown={(e) => e.key === 'Escape' && setShowShareMenu(false)}
              role="button"
              tabIndex={0}
              aria-label={t('accessibility.closeShareMenu')}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <button
                onClick={() => {
                  shareToKakao();
                  setShowShareMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {t('blog.kakaoTalk')}
              </button>
              <button
                onClick={() => {
                  shareToFacebook();
                  setShowShareMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {t('blog.facebook')}
              </button>
              <button
                onClick={() => {
                  shareToTwitter();
                  setShowShareMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {t('blog.twitter')}
              </button>
              <button
                onClick={() => {
                  shareToLinkedIn();
                  setShowShareMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {t('blog.linkedin')}
              </button>
              <button
                onClick={() => {
                  copyLink();
                  setShowShareMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700"
              >
                <span className="flex items-center">
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      {t('blog.linkCopied')}
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      {t('blog.copyLink')}
                    </>
                  )}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogInteractions;
