import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BlogCard from './BlogCard';
import Loading from '../common/Loading';
import ErrorBoundary from '../common/ErrorBoundary';
import SEO from '../layout/SEO';
import { api } from '../../services/api';

const POSTS_PER_PAGE = 6;

const BlogListPage = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState(['All']);
    const [pageCount, setPageCount] = useState(1);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.getBlogPosts(currentPage);
                console.log('API Response:', response.data); // 디버깅용 로그

                if (response.data && Array.isArray(response.data.results)) {
                    setPosts(response.data.results);
                    // 전체 페이지 수 계산
                    const totalPosts = response.data.count;
                    setPageCount(Math.ceil(totalPosts / POSTS_PER_PAGE));

                    // Extract unique categories
                    const uniqueCategories = ['All', ...new Set(response.data.results.map((post) => post.category))];
                    setCategories(uniqueCategories);
                } else {
                    throw new Error('Unexpected API response structure');
                }
            } catch (error) {
                console.error('Error fetching blog posts:', error);
                setError('블로그 포스트를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [currentPage]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const filteredPosts = filter === 'All' ? posts : posts.filter((post) => post.category === filter);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
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
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
                        <h1 className="text-3xl font-bold">블로그</h1>
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
                            {pageCount > 1 && (
                                <div className="flex justify-center mt-12 space-x-2">
                                    {Array.from({ length: pageCount }).map((_, index) => (
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
