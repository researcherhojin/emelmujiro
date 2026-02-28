import React, { memo, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import SEOHelmet from '../common/SEOHelmet';
import BlogCard from './BlogCard';
import BlogSearch from './BlogSearch';
import { useBlog } from '../../contexts/BlogContext';
import { BlogPost } from '../../types';
import { PageLoading } from '../common/UnifiedLoading';

const BlogListPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const { posts, loading, error, totalPages, currentPage, fetchPosts } =
    useBlog();
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

  const handleSearch = useCallback((results: BlogPost[]) => {
    setFilteredPosts(results);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchPosts(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [fetchPosts]
  );

  if (loading) {
    return <PageLoading />;
  }

  return (
    <>
      <SEOHelmet
        title={t('blog.seo.title')}
        description={t('blog.seo.description')}
        url="https://researcherhojin.github.io/emelmujiro/blog"
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              {t('blog.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('blog.subtitle')}
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-12">
            <BlogSearch onSearch={handleSearch} />
          </div>

          {/* Error */}
          {error && (
            <div className="text-center text-red-500 mb-8">{error}</div>
          )}

          {/* Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('blog.noPosts')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('blog.noPostsDescription')}
                </p>
              </div>
            )
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('blog.previousPage')}
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('blog.pageOf', {
                  current: currentPage,
                  total: totalPages,
                })}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('blog.nextPage')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

BlogListPage.displayName = 'BlogListPage';

export default BlogListPage;
