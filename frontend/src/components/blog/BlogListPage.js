import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import BlogCard from './BlogCard';
import BlogSearch from './BlogSearch';
import Loading from '../common/Loading';
import ErrorBoundary from '../common/ErrorBoundary';
import SEO from '../layout/SEO';
import { useBlog } from '../../contexts/BlogContext';

const BlogListPage = () => {
    const navigate = useNavigate();
    const { posts, loading, error, totalPages, currentPage, fetchPosts } = useBlog();
    const [filter, setFilter] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const [searchResults, setSearchResults] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchPosts(currentPage);
        // Check admin mode
        const adminMode = localStorage.getItem('adminMode') === 'true';
        setIsAdmin(adminMode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    // Extract categories from posts
    useEffect(() => {
        if (posts.length > 0) {
            const uniqueCategories = ['All', ...new Set(posts.map((post) => post.category).filter(Boolean))];
            setCategories(uniqueCategories);
        }
    }, [posts]);

    const handleSearch = (results) => {
        setSearchResults(results);
    };

    // Use search results if available, otherwise use filtered posts
    const displayPosts = searchResults !== null ? searchResults : posts;
    const filteredPosts = filter === 'All' ? displayPosts : displayPosts.filter((post) => post.category === filter);

    const handlePageChange = (newPage) => {
        fetchPosts(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return <Loading message="블로그 포스트를 불러오는 중입니다..." />;
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 pt-20">
                <SEO
                    title="블로그 | 에멜무지로"
                    description="AI와 IT 관련 최신 소식과 인사이트를 공유합니다"
                    keywords="블로그, AI, IT, 에멜무지로"
                />

                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold">블로그</h1>
                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/blog/new')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                                >
                                    <PlusCircle className="w-5 h-5 mr-2" />
                                    글쓰기
                                </button>
                            )}
                        </div>
                        
                        {/* Search Bar */}
                        <div className="mb-6">
                            <BlogSearch onSearch={handleSearch} />
                        </div>

                        {/* Filter */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                                {searchResults !== null && searchResults.length !== posts.length && 
                                    `검색 결과: ${searchResults.length}개`}
                            </span>
                            <div className="relative">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg
                                        className="fill-current h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className="text-center py-12 text-red-600">{error}</div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPosts.map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                    >
                                        <BlogCard post={post} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-12 space-x-2">
                                    {Array.from({ length: totalPages }).map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(index + 1)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                currentPage === index + 1
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredPosts.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    해당 카테고리에 게시물이 없습니다.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default BlogListPage;
