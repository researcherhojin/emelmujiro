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
import BlogInteractions from './BlogInteractions';
import BlogComments from './BlogComments';
import { useBlog } from '../../contexts/BlogContext';
import { formatDate } from '../../utils/dateFormat';

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

  if (loading) {
    return <PageLoading message={t('blogDetail.loading')} />;
  }

  if (error && error.includes('404')) {
    localizedNavigate('/404', { replace: true });
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {t('common.goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {post && (
          <SEOHelmet
            title={`${post.title} | ${t('blogDetail.blogTitle')}`}
            description={post.excerpt || post.title}
            keywords={`${post.category}, ${t('blogDetail.blogKeywords')}`}
          />
        )}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('common.goBack')}
          </button>
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 overflow-hidden">
            {post?.image_url && (
              <img
                src={post.image_url}
                alt={`${post.title} ${t('blogDetail.relatedImage')}`}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-8">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 text-sm rounded-full mb-4 font-medium bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {post?.category}
                </span>
                <time
                  dateTime={post?.date}
                  className="text-sm text-gray-500 dark:text-gray-400 ml-4"
                >
                  {post?.date && formatDate(post.date)}
                </time>
              </div>
              <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                {post?.title}
              </h1>

              {/* Author and tags */}
              <div className="flex items-center mb-6 text-gray-600 dark:text-gray-400">
                <span>
                  {t('blogDetail.author')} {post?.author}
                </span>
                {post?.tags && post.tags.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <div className="flex gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Content with Markdown support */}
              <div className="prose prose-indigo dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post?.content || ''}</ReactMarkdown>
              </div>

              {/* Like and Share buttons */}
              {post && <BlogInteractions post={post} />}

              {/* Comments section */}
              {post && <BlogComments postId={post.id} />}
            </div>
          </article>
        </div>
      </div>
    </ErrorBoundary>
  );
});

BlogDetailPage.displayName = 'BlogDetailPage';

export default BlogDetailPage;
