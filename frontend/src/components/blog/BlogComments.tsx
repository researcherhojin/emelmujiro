import React, { useState, useEffect, memo, useCallback } from 'react';
import { MessageCircle, Send, User, Calendar, ThumbsUp, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlogComment } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import logger from '../../utils/logger';
import { formatRelativeTime } from '../../utils/dateFormat';

interface BlogCommentsProps {
  postId: string | number;
}

interface ReplyItemProps {
  reply: BlogComment;
  postId: string | number;
  formatCommentDate: (dateString: string) => string;
  onLike: (commentId: number) => void;
  t: (key: string, options?: Record<string, string>) => string;
}

const ReplyItem: React.FC<ReplyItemProps> = ({ reply, formatCommentDate, onLike, t }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
    <div className="flex items-center mb-1">
      <User className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" />
      <span className="font-medium text-sm text-gray-900 dark:text-gray-200">
        {reply.author_name}
      </span>
      <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {formatCommentDate(reply.created_at)}
      </span>
    </div>
    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{reply.content}</p>
    <button
      onClick={() => onLike(reply.id)}
      aria-label={t('blog.likeReply', { author: reply.author_name })}
      className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600"
    >
      <ThumbsUp className="w-3 h-3" />
      <span>{reply.likes}</span>
    </button>
  </div>
);

interface CommentItemProps {
  comment: BlogComment;
  postId: string | number;
  replyTo: number | null;
  replyContent: string;
  formatCommentDate: (dateString: string) => string;
  onLike: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  isAdmin: boolean;
  setReplyTo: (id: number | null) => void;
  setReplyContent: (content: string) => void;
  onSubmitReply: (commentId: number) => void;
  t: (key: string, options?: Record<string, string>) => string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  replyTo,
  replyContent,
  formatCommentDate,
  onLike,
  onDelete,
  isAdmin,
  setReplyTo,
  setReplyContent,
  onSubmitReply,
  t,
}) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <User className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-gray-200">
            {comment.author_name}
          </span>
          <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
          <Calendar className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatCommentDate(comment.created_at)}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-3">{comment.content}</p>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onLike(comment.id)}
            aria-label={t('blog.likeComment', { author: comment.author_name })}
            className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{comment.likes}</span>
          </button>
          <button
            onClick={() => setReplyTo(comment.id)}
            aria-label={t('blog.replyTo', { author: comment.author_name })}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {t('blog.reply')}
          </button>
          {isAdmin && (
            <button
              onClick={() => onDelete(comment.id)}
              aria-label={t('common.delete')}
              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('common.delete')}</span>
            </button>
          )}
        </div>

        {/* Reply form */}
        {replyTo === comment.id && (
          <div className="mt-4 ml-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t('blog.replyPlaceholder')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => onSubmitReply(comment.id)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                {t('blog.writeReply')}
              </button>
              <button
                onClick={() => {
                  setReplyTo(null);
                  setReplyContent('');
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-sm"
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
              <ReplyItem
                key={reply.id}
                reply={reply}
                postId={postId}
                formatCommentDate={formatCommentDate}
                onLike={onLike}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const BlogComments: React.FC<BlogCommentsProps> = ({ postId }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Load saved author name
  useEffect(() => {
    const savedName = localStorage.getItem('commentAuthorName');
    if (savedName) setAuthorName(savedName);
  }, []);

  // Fetch comments from API
  const fetchComments = useCallback(async () => {
    try {
      const response = await api.getComments(postId);
      setComments(response.data);
    } catch (error) {
      logger.error('Failed to load comments:', error);
      setComments([]);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    try {
      localStorage.setItem('commentAuthorName', authorName);
      await api.createComment(postId, { author_name: authorName, content: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      logger.error('Failed to create comment:', error);
    }
  };

  // Add reply
  const handleSubmitReply = async (commentId: number) => {
    if (!replyContent.trim() || !authorName.trim()) return;

    try {
      localStorage.setItem('commentAuthorName', authorName);
      await api.createComment(postId, {
        author_name: authorName,
        content: replyContent,
        parent: commentId,
      });
      setReplyTo(null);
      setReplyContent('');
      fetchComments();
    } catch (error) {
      logger.error('Failed to create reply:', error);
    }
  };

  // Toggle like on comment
  const handleLikeComment = useCallback(
    async (commentId: number) => {
      try {
        await api.likeComment(postId, commentId);
        fetchComments();
      } catch (error) {
        logger.error('Failed to like comment:', error);
      }
    },
    [postId, fetchComments]
  );

  // Delete comment (admin only)
  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      try {
        await api.deleteComment(postId, commentId);
        fetchComments();
      } catch (error) {
        logger.error('Failed to delete comment:', error);
      }
    },
    [postId, fetchComments]
  );

  // Format date — delegates to shared utility
  const formatCommentDate = (dateString: string) =>
    formatRelativeTime(dateString, i18n.language, t);

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
        <MessageCircle className="mr-2" />
        {t('blog.commentsCount', { count: comments.length })}
      </h3>

      {/* Comment form */}
      <form
        onSubmit={handleSubmitComment}
        className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <div className="mb-4">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={t('blog.namePlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('blog.commentPlaceholder')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            replyTo={replyTo}
            replyContent={replyContent}
            formatCommentDate={formatCommentDate}
            onLike={handleLikeComment}
            onDelete={handleDeleteComment}
            isAdmin={isAdmin}
            setReplyTo={setReplyTo}
            setReplyContent={setReplyContent}
            onSubmitReply={handleSubmitReply}
            t={t}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          {t('blog.noCommentsYet')}
        </p>
      )}
    </div>
  );
};

export default memo(BlogComments);
