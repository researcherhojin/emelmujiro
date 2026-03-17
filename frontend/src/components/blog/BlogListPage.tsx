import React, { memo, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SEOHelmet from '../common/SEOHelmet';
import { SITE_URL } from '../../utils/constants';
import BlogCard from './BlogCard';
import BlogSearch from './BlogSearch';
import { useBlog } from '../../contexts/BlogContext';
import { BlogPost } from '../../types';
import { PageLoading } from '../common/UnifiedLoading';

const BlogListPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const { posts, loading, error, totalPages, currentPage, fetchPosts } = useBlog();
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

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <>
      <SEOHelmet
        title={t('blog.seo.title')}
        description={t('blog.seo.description')}
        url={`${SITE_URL}/blog`}
      />

      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Hero Section */}
        <section className="border-b border-gray-100 dark:border-gray-800/50">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-24 pb-16 sm:pt-32 sm:pb-20">
            <p className="text-[11px] font-medium tracking-[0.25em] text-gray-400 dark:text-gray-500 uppercase mb-5">
              {t('blog.sectionLabel')}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-5">
              {t('blog.title')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 dark:text-gray-500 font-light max-w-xl">
              {t('blog.subtitle')}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
          {/* Error */}
          {error && (
            <div className="text-center text-red-500 dark:text-red-400 mb-12 text-sm">{error}</div>
          )}

          {/* Posts */}
          {filteredPosts.length > 0 ? (
            <>
              {/* Search */}
              <div className="max-w-md mx-auto mb-16">
                <BlogSearch onSearch={handleSearch} />
              </div>

              {/* Featured Post */}
              {featuredPost && (
                <div className="mb-16">
                  <BlogCard post={featuredPost} featured />
                </div>
              )}

              {/* Grid */}
              {remainingPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {remainingPosts.map((post, index) => (
                    <BlogCard key={post.id} post={{ ...post, _index: index } as BlogPost} />
                  ))}
                </div>
              )}
            </>
          ) : (
            !loading && (
              <div className="text-center py-24">
                <p className="text-[11px] font-medium tracking-[0.25em] text-gray-300 dark:text-gray-600 uppercase mb-6">
                  COMING SOON
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
                  {t('blog.comingSoon')}
                </h2>
                <p className="text-gray-400 dark:text-gray-500 max-w-md mx-auto leading-relaxed">
                  {t('blog.comingSoonDescription')}
                </p>
              </div>
            )
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-20">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('blog.previousPage')}
              </button>

              <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">
                {t('blog.pageOf', {
                  current: currentPage,
                  total: totalPages,
                })}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              >
                {t('blog.nextPage')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
});

BlogListPage.displayName = 'BlogListPage';

export default BlogListPage;
