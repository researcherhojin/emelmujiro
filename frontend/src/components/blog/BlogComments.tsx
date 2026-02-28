import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Calendar, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logger from '../../utils/logger';

interface Comment {
  id: string;
  postId: string | number;
  author: string;
  content: string;
  date: string;
  likes: number;
  likedBy: string[];
  replies?: Comment[];
}

interface BlogCommentsProps {
  postId: string | number;
}

const BlogComments: React.FC<BlogCommentsProps> = ({ postId }) => {
  const { t, i18n } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Generate unique user ID (for demo purposes)
  const getUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  // Load comments from localStorage
  useEffect(() => {
    const loadComments = () => {
      try {
        const allComments = localStorage.getItem('blogComments');
        if (allComments) {
          const parsed = JSON.parse(allComments);
          setComments(parsed[postId] || []);
        }
      } catch (error) {
        logger.error('Failed to load comments:', error);
        setComments([]);
      }
    };

    loadComments();

    // Load saved author name
    const savedName = localStorage.getItem('commentAuthorName');
    if (savedName) {
      setAuthorName(savedName);
    }
  }, [postId]);

  // Save comments to localStorage
  const saveComments = (updatedComments: Comment[]) => {
    try {
      const storedComments = localStorage.getItem('blogComments');
      const allComments = storedComments ? JSON.parse(storedComments) : {};
      allComments[postId] = updatedComments;
      localStorage.setItem('blogComments', JSON.stringify(allComments));
      setComments(updatedComments);
    } catch (error) {
      logger.error('Failed to save comments:', error);
    }
  };

  // Add new comment
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !authorName.trim()) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      author: authorName,
      content: newComment,
      date: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: [],
    };

    // Save author name for future use
    localStorage.setItem('commentAuthorName', authorName);

    saveComments([comment, ...comments]);
    setNewComment('');
  };

  // Add reply to comment
  const handleSubmitReply = (commentId: string) => {
    if (!replyContent.trim() || !authorName.trim()) return;

    const reply: Comment = {
      id: `reply_${Date.now()}`,
      postId,
      author: authorName,
      content: replyContent,
      date: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply],
        };
      }
      return comment;
    });

    saveComments(updatedComments);
    setReplyTo(null);
    setReplyContent('');
  };

  // Toggle like on comment
  const toggleLike = (
    commentId: string,
    isReply: boolean = false,
    parentId?: string
  ) => {
    const userId = getUserId();

    const updatedComments = comments.map((comment) => {
      if (!isReply && comment.id === commentId) {
        const likedBy = comment.likedBy || [];
        const isLiked = likedBy.includes(userId);

        return {
          ...comment,
          likes: isLiked ? comment.likes - 1 : comment.likes + 1,
          likedBy: isLiked
            ? likedBy.filter((id) => id !== userId)
            : [...likedBy, userId],
        };
      } else if (isReply && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies?.map((reply) => {
            if (reply.id === commentId) {
              const likedBy = reply.likedBy || [];
              const isLiked = likedBy.includes(userId);

              return {
                ...reply,
                likes: isLiked ? reply.likes - 1 : reply.likes + 1,
                likedBy: isLiked
                  ? likedBy.filter((id) => id !== userId)
                  : [...likedBy, userId],
              };
            }
            return reply;
          }),
        };
      }
      return comment;
    });

    saveComments(updatedComments);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes === 0
          ? t('blog.timeJustNow')
          : t('blog.timeMinutesAgo', { count: minutes });
      }
      return t('blog.timeHoursAgo', { count: hours });
    } else if (days < 7) {
      return t('blog.timeDaysAgo', { count: days });
    } else {
      return date.toLocaleDateString(
        i18n.language === 'ko' ? 'ko-KR' : 'en-US'
      );
    }
  };

  const userId = getUserId();

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6 flex items-center">
        <MessageCircle className="mr-2" />
        {t('blog.commentsCount', { count: comments.length })}
      </h3>

      {/* Comment form */}
      <form
        onSubmit={handleSubmitComment}
        className="mb-8 p-4 bg-gray-50 rounded-lg"
      >
        <div className="mb-4">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={t('blog.namePlaceholder')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('blog.commentPlaceholder')}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Send className="w-4 h-4 mr-2" />
          {t('blog.writeComment')}
        </button>
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">{comment.author}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.date)}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{comment.content}</p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={`flex items-center space-x-1 text-sm ${
                      comment.likedBy?.includes(userId)
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{comment.likes}</span>
                  </button>
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    {t('blog.reply')}
                  </button>
                </div>

                {/* Reply form */}
                {replyTo === comment.id && (
                  <div className="mt-4 ml-4 p-3 bg-gray-50 rounded">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={t('blog.replyPlaceholder')}
                      rows={2}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSubmitReply(comment.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        {t('blog.writeReply')}
                      </button>
                      <button
                        onClick={() => {
                          setReplyTo(null);
                          setReplyContent('');
                        }}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-8 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center mb-1">
                          <User className="w-3 h-3 mr-1 text-gray-500" />
                          <span className="font-medium text-sm">
                            {reply.author}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {reply.content}
                        </p>
                        <button
                          onClick={() => toggleLike(reply.id, true, comment.id)}
                          className={`flex items-center space-x-1 text-xs ${
                            reply.likedBy?.includes(userId)
                              ? 'text-blue-600'
                              : 'text-gray-500 hover:text-blue-600'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{reply.likes}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          {t('blog.noCommentsYet')}
        </p>
      )}
    </div>
  );
};

export default BlogComments;
