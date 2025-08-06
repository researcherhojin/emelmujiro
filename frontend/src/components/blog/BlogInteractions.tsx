import React, { useState, useEffect } from 'react';
import { Heart, Share2, Bookmark, Link2, Check } from 'lucide-react';
import { BlogPost } from '../../types';

interface BlogInteractionsProps {
  post: BlogPost;
}

const BlogInteractions: React.FC<BlogInteractionsProps> = ({ post }) => {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate unique user ID
  const getUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  // Load interactions from localStorage
  useEffect(() => {
    try {
      const userId = getUserId();
      
      // Load likes
      const likesData = localStorage.getItem('postLikes');
      const postLikes = likesData ? JSON.parse(likesData) : {};
      const postLikeData = postLikes[post.id] || { count: 0, users: [] };
      setLikes(postLikeData.count);
      setIsLiked(postLikeData.users.includes(userId));

      // Load bookmarks
      const bookmarksData = localStorage.getItem('bookmarks');
      const bookmarks: Array<{id: number}> = bookmarksData ? JSON.parse(bookmarksData) : [];
      setIsBookmarked(bookmarks.some(b => b.id === post.id));
    } catch (error) {
      console.error('Failed to load interactions:', error);
      setLikes(0);
      setIsLiked(false);
      setIsBookmarked(false);
    }
  }, [post.id]);

  // Toggle like
  const toggleLike = () => {
    try {
      const userId = getUserId();
      const likesData = localStorage.getItem('postLikes');
      const postLikes = likesData ? JSON.parse(likesData) : {};
      const postLikeData = postLikes[post.id] || { count: 0, users: [] };

    if (isLiked) {
      // Unlike
      postLikeData.count = Math.max(0, postLikeData.count - 1);
      postLikeData.users = postLikeData.users.filter((id: string) => id !== userId);
    } else {
      // Like
      postLikeData.count += 1;
      postLikeData.users.push(userId);
    }

      postLikes[post.id] = postLikeData;
      localStorage.setItem('postLikes', JSON.stringify(postLikes));
      
      setLikes(postLikeData.count);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // Toggle bookmark
  const toggleBookmark = () => {
    try {
      const bookmarksData = localStorage.getItem('bookmarks');
      const bookmarks: Array<{id: string | number, title: string, excerpt: string, date?: string, savedAt: string}> = bookmarksData ? JSON.parse(bookmarksData) : [];
      
      if (isBookmarked) {
        // Remove bookmark
        const filtered = bookmarks.filter(b => b.id !== post.id);
        localStorage.setItem('bookmarks', JSON.stringify(filtered));
      } else {
      // Add bookmark
      const bookmark = {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || post.title,
        date: post.date,
        savedAt: new Date().toISOString()
      };
        bookmarks.unshift(bookmark);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      }
      
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  // Share functions
  const shareUrl = window.location.href;
  const shareTitle = post.title;
  const shareText = post.excerpt;

  const shareToKakao = () => {
    // Note: Kakao SDK would need to be initialized in index.html
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(kakaoUrl, '_blank', 'width=500,height=600');
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=500,height=600');
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=500,height=600');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=500,height=600');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or error - silently handle
      }
    } else {
      setShowShareMenu(true);
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-y my-8">
      <div className="flex items-center space-x-4">
        {/* Like button */}
        <button
          onClick={toggleLike}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isLiked 
              ? 'bg-red-50 text-red-600' 
              : 'hover:bg-gray-100 text-gray-600'
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
              ? 'bg-yellow-50 text-yellow-600' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Share button */}
      <div className="relative">
        <button
          onClick={nativeShare}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">공유</span>
        </button>

        {/* Share menu */}
        {showShareMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowShareMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <button
                onClick={() => {
                  shareToKakao();
                  setShowShareMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                카카오톡
              </button>
              <button
                onClick={() => {
                  shareToFacebook();
                  setShowShareMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Facebook
              </button>
              <button
                onClick={() => {
                  shareToTwitter();
                  setShowShareMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Twitter
              </button>
              <button
                onClick={() => {
                  shareToLinkedIn();
                  setShowShareMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                LinkedIn
              </button>
              <button
                onClick={() => {
                  copyLink();
                  setShowShareMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-t"
              >
                <span className="flex items-center">
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      복사됨!
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      링크 복사
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