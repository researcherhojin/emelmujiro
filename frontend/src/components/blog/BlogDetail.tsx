import React, { useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loading from '../common/Loading';
import ErrorBoundary from '../common/ErrorBoundary';
import SEO from '../layout/SEO';
import BlogInteractions from './BlogInteractions';
import BlogComments from './BlogComments';
import { useBlog } from '../../contexts/BlogContext';
import { formatDate } from '../../utils/dateFormat';

const BlogDetailPage: React.FC = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPost: post, loading, error, fetchPostById, clearCurrentPost } = useBlog();

  useEffect(() => {
    if (id) {
      fetchPostById(id);
    }
    return () => clearCurrentPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <Loading message="블로그 포스트를 불러오는 중입니다..." />;
  }

  if (error && error.includes('404')) {
    navigate('/404', { replace: true });
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
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
            description={post.excerpt || post.title}
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
            {post?.image_url && (
              <img
                src={post.image_url}
                alt={`${post.title} 관련 이미지`}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-8">
              <div className="mb-6">
                <span
                  className="inline-block px-3 py-1 text-sm rounded-full mb-4 font-medium"
                  style={{
                    backgroundColor: '#E0E7FF',
                    color: '#4F46E5',
                  }}
                >
                  {post?.category}
                </span>
                <time dateTime={post?.date} className="text-sm text-gray-500 ml-4">
                  {post?.date && formatDate(post.date)}
                </time>
              </div>
              <h1 className="text-3xl font-bold mb-6">{post?.title}</h1>

              {/* Author and tags */}
              <div className="flex items-center mb-6 text-gray-600">
                <span>작성자: {post?.author}</span>
                {post?.tags && post.tags.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <div className="flex gap-2">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Content with Markdown support */}
              <div className="prose prose-indigo max-w-none">
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
