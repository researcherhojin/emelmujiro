import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Loading from '../common/Loading';
import ErrorBoundary from '../common/ErrorBoundary';
import SEO from '../layout/SEO';
import { api } from '../../services/api';
import { formatDate } from '../../utils/dateFormat';

const BlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.getBlogPost(id);
                setPost(response.data);
            } catch (error) {
                console.error('Error fetching blog post:', error);
                setError(error.response?.status === 404 ? 'not_found' : 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (isLoading) {
        return <Loading message="블로그 포스트를 불러오는 중입니다..." />;
    }

    if (error === 'not_found') {
        navigate('/404', { replace: true });
        return null;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <p className="text-red-600">포스트를 불러오는 중 오류가 발생했습니다.</p>
                    <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:text-indigo-700">
                        뒤로 가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 pt-20">
                {post && (
                    <SEO
                        title={`${post.title} | 에멜무지로 블로그`}
                        description={post.description}
                        keywords={`${post.category}, 에멜무지로, 블로그`}
                        ogImage={post.image_url}
                    />
                )}
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-8 text-indigo-600 hover:text-indigo-700 flex items-center group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        뒤로가기
                    </button>
                    <article className="bg-white rounded-lg shadow-md overflow-hidden">
                        {post.image_url && <img src={post.image_url} alt="" className="w-full h-64 object-cover" />}
                        <div className="p-8">
                            <div className="mb-6">
                                <span
                                    className="inline-block px-3 py-1 text-sm rounded-full mb-4 font-medium"
                                    style={{
                                        backgroundColor: post.categoryColor || '#E0E7FF',
                                        color: '#4F46E5',
                                    }}
                                >
                                    {post.category}
                                </span>
                                <time dateTime={post.date} className="text-sm text-gray-500 ml-4">
                                    {formatDate(post.date)}
                                </time>
                            </div>
                            <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
                            <div
                                className="prose prose-indigo max-w-none"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>
                    </article>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default BlogDetailPage;
