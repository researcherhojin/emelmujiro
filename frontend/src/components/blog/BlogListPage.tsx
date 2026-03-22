import React, { memo, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Construction } from 'lucide-react';
import SEOHelmet from '../common/SEOHelmet';
import { SITE_URL } from '../../utils/constants';
import BlogCard from './BlogCard';
import BlogSearch from './BlogSearch';
import { useBlog } from '../../contexts/BlogContext';
import { api } from '../../services/api';
import { BlogPost } from '../../types';
import { PageLoading } from '../common/UnifiedLoading';
import logger from '../../utils/logger';

interface Category {
  slug: string;
  name: string;
  count?: number;
}

const BlogListPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const { posts, loading, error, totalPages, currentPage, fetchPosts } = useBlog();
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getBlogCategories();
        setCategories(response.data as Category[]);
      } catch {
        logger.warn('Failed to fetch blog categories');
      }
    };
    fetchCategories();
  }, []);

  // Apply category filter only when search is not active
  useEffect(() => {
    if (isSearchActive) return;
    if (activeCategory === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((p) => p.category === activeCategory));
    }
  }, [posts, activeCategory, isSearchActive]);

  const handleSearch = useCallback(
    (results: BlogPost[]) => {
      if (results === posts) {
        // Search cleared — revert to category filter
        setIsSearchActive(false);
      } else {
        setIsSearchActive(true);
        setActiveCategory('all');
        setFilteredPosts(results);
      }
    },
    [posts]
  );

  const handleCategoryChange = useCallback((slug: string) => {
    setIsSearchActive(false);
    setActiveCategory(slug);
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

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
              {t('blog.sectionLabel')}
            </span>
            <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white">
              {t('blog.title')}
            </h1>
            <p className="mt-6 text-base sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto break-keep">
              {t('blog.subtitle')}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">
            {/* Error */}
            {error && (
              <div className="text-center text-red-500 dark:text-red-400 mb-12 text-sm">
                {error}
              </div>
            )}

            {/* Search + Category Filter — always visible when posts exist */}
            {posts.length > 0 && (
              <>
                <div className="max-w-md mx-auto mb-8">
                  <BlogSearch onSearch={handleSearch} />
                </div>

                {/* Category Filter Tabs */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-16">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                        activeCategory === 'all'
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {t('blog.allCategories')}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                          activeCategory === cat.slug
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {cat.name}
                        {cat.count != null && (
                          <span className="ml-1.5 text-xs opacity-60">{cat.count}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Posts */}
            {filteredPosts.length > 0 ? (
              <>
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
            ) : posts.length > 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  {t('blog.noSearchResults')}
                </p>
              </div>
            ) : (
              !loading && (
                <div className="text-center py-24">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
                    {t('blog.comingSoonLabel')}
                  </span>
                  <h2 className="mt-4 text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                    {t('blog.comingSoon')}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed break-keep">
                    {t('blog.comingSoonDescription')}
                  </p>
                  <Construction
                    className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mt-8"
                    aria-hidden="true"
                  />
                </div>
              )
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 mt-20">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t('blog.previousPage')}
                </button>

                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                  {t('blog.pageOf', {
                    current: currentPage,
                    total: totalPages,
                  })}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {t('blog.nextPage')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
});

BlogListPage.displayName = 'BlogListPage';

export default BlogListPage;
