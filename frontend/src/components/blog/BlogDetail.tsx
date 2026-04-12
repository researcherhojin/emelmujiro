import React, { lazy, Suspense, useEffect, useState, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Trash2, Pencil } from 'lucide-react';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import { useToast } from '../../hooks/useToast';
import { sanitizeBlogHtml } from '../../utils/sanitizeBlogHtml';

const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'));
import { PageLoading } from '../common/UnifiedLoading';
import ErrorBoundary from '../common/ErrorBoundary';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';
import BlogInteractions from './BlogInteractions';
import BlogComments from './BlogComments';
import Toast from '../common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { useBlog } from '../../contexts/BlogContext';
import { api } from '../../services/api';
import logger from '../../utils/logger';
import { formatDate } from '../../utils/dateFormat';
import { trackBlogView } from '../../utils/analytics';
import { preventImageAction } from '../../utils/imageUtils';

const BlogDetailPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { localizedNavigate } = useLocalizedPath();
  const { user } = useAuth();
  const { currentPost: post, loading, error, fetchPostById, clearCurrentPost } = useBlog();
  const isAdmin = user?.role === 'admin';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast, showToast } = useToast();

  const handleTogglePublish = useCallback(async () => {
    if (!slug) return;
    try {
      const response = await api.toggleBlogPublish(slug);
      const published = response.data.is_published;
      showToast(published ? t('blogAdmin.published') : t('blogAdmin.unpublished'), 'success');
      fetchPostById(slug);
    } catch (err) {
      logger.error('Failed to toggle publish:', err);
      showToast(t('blogAdmin.toggleError'), 'error');
    }
  }, [slug, fetchPostById, showToast, t]);

  const handleDelete = useCallback(async () => {
    if (!slug) return;
    try {
      await api.deleteBlogPost(slug);
      showToast(t('blogAdmin.deleted'), 'success');
      setTimeout(() => localizedNavigate('/insights'), 500);
    } catch (err) {
      logger.error('Failed to delete post:', err);
      showToast(t('blogAdmin.deleteError'), 'error');
    }
  }, [slug, localizedNavigate, showToast, t]);

  useEffect(() => {
    if (slug) {
      fetchPostById(slug);
    }
    return () => clearCurrentPost();
    // Both callbacks are useCallback([]) in BlogContext — stable refs,
    // including them is safe and doesn't cause extra runs.
  }, [slug, fetchPostById, clearCurrentPost]);

  useEffect(() => {
    if (post && slug) {
      trackBlogView(slug, post.category);
    }
  }, [post, slug]);

  if (loading) {
    return <PageLoading message={t('blogDetail.loading')} />;
  }

  if (error && error.includes('404')) {
    localizedNavigate('/404', { replace: true });
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p className="text-red-700 dark:text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300"
          >
            {t('common.goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* Admin Toolbar */}
        {isAdmin && post && (
          <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
            <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t('blogAdmin.label')}
                </span>
                <button
                  onClick={handleTogglePublish}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    post.is_published
                      ? 'bg-green-900/50 text-green-400 hover:bg-green-900/70'
                      : 'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900/70'
                  }`}
                >
                  {post.is_published ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  {post.is_published ? t('blogAdmin.published') : t('blogAdmin.draft')}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => localizedNavigate(`/insights/edit/${post?.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t('common.edit')}
                </button>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400">{t('blogAdmin.confirmDelete')}</span>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      {t('common.confirm')}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('common.delete')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {post && (
          <>
            <SEOHelmet
              title={`${post.title} | ${t('blogDetail.blogTitle')}`}
              description={post.description || post.title}
              keywords={`${post.category}, ${t('blogDetail.blogKeywords')}`}
              image={post.image_url}
              type="article"
              article={{
                author: post.author,
                publishedTime: post.date,
                modifiedTime: post.updated_at || post.date,
                section: post.category,
                tags: post.tags,
              }}
            />
            <StructuredData
              type="Article"
              article={{
                title: post.title,
                description: post.description || post.title,
                author: post.author,
                publishedTime: post.date,
                modifiedTime: post.updated_at || post.date,
                category: post.category,
                tags: post.tags,
                image: post.image_url,
              }}
            />
          </>
        )}

        {/* Hero Image */}
        {post?.image_url && (
          <div className="w-full max-w-5xl mx-auto px-6 sm:px-8 pt-8">
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
              <img
                src={post.image_url}
                alt={`${post.title} ${t('blogDetail.relatedImage')}`}
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable="false"
                onContextMenu={preventImageAction}
                onDragStart={preventImageAction}
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
          {/* Back Navigation */}
          <button
            onClick={() => navigate(-1)}
            className="mb-10 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.goBack')}
          </button>

          <article>
            {/* Meta */}
            <div className="flex items-center gap-3 mb-6">
              {post?.category && (
                <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-gray-500 dark:text-gray-400">
                  {post.category}
                </span>
              )}
              {post?.category && post?.date && (
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              )}
              {post?.date && (
                <time
                  dateTime={post.date}
                  className="text-[11px] tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {formatDate(post.date)}
                </time>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-8">
              {post?.title}
            </h1>

            {/* Author & Tags */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-10 mb-10 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('blogDetail.author')} {post?.author}
              </span>
              {post?.tags && post.tags.length > 0 && (
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-a:text-gray-900 dark:prose-a:text-white prose-a:underline-offset-4 prose-img:rounded-xl">
              {post?.content_html ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeBlogHtml(post.content_html),
                  }}
                />
              ) : (
                <Suspense fallback={null}>
                  <MarkdownRenderer content={post?.content || ''} />
                </Suspense>
              )}
            </div>

            {/* Interactions */}
            <div className="mt-12 pt-10 border-t border-gray-100 dark:border-gray-800">
              {post && <BlogInteractions post={post} />}
            </div>

            {/* Comments */}
            <div className="mt-10">{post && <BlogComments postId={post.id} />}</div>
          </article>
        </div>
      </div>
    </ErrorBoundary>
  );
});

BlogDetailPage.displayName = 'BlogDetailPage';

export default BlogDetailPage;
