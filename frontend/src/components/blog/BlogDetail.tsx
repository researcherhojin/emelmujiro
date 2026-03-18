import React, { useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageLoading } from '../common/UnifiedLoading';
import ErrorBoundary from '../common/ErrorBoundary';
import SEOHelmet from '../common/SEOHelmet';
import StructuredData from '../common/StructuredData';
import BlogInteractions from './BlogInteractions';
import BlogComments from './BlogComments';
import { useBlog } from '../../contexts/BlogContext';
import { SITE_URL } from '../../utils/constants';
import { formatDate } from '../../utils/dateFormat';
import { trackBlogView } from '../../utils/analytics';

const preventImageAction = (e: React.MouseEvent | React.DragEvent) => {
  e.preventDefault();
};

const BlogDetailPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { localizedNavigate } = useLocalizedPath();
  const { currentPost: post, loading, error, fetchPostById, clearCurrentPost } = useBlog();

  useEffect(() => {
    if (id) {
      fetchPostById(id);
    }
    return () => clearCurrentPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (post && id) {
      trackBlogView(id, post.category);
    }
  }, [post, id]);

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
          <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
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
        {post && (
          <>
            <SEOHelmet
              title={`${post.title} | ${t('blogDetail.blogTitle')}`}
              description={post.excerpt || post.title}
              keywords={`${post.category}, ${t('blogDetail.blogKeywords')}`}
              url={`${SITE_URL}/blog/${id}`}
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
                description: post.excerpt || post.title,
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
            className="mb-10 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.goBack')}
          </button>

          <article>
            {/* Meta */}
            <div className="flex items-center gap-3 mb-6">
              {post?.category && (
                <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-gray-400 dark:text-gray-500">
                  {post.category}
                </span>
              )}
              {post?.category && post?.date && (
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              )}
              {post?.date && (
                <time
                  dateTime={post.date}
                  className="text-[11px] tracking-wide text-gray-400 dark:text-gray-500"
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
                      className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-a:text-gray-900 dark:prose-a:text-white prose-a:underline-offset-4 prose-img:rounded-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post?.content || ''}</ReactMarkdown>
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
