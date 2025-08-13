import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BlogCard from '../blog/BlogCard';
import { ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { BlogPost } from '../../types';

interface BlogSectionProps {
  posts: BlogPost[];
  isLoading?: boolean;
  error?: string | null;
}

interface BlogPostCardProps {
  post: BlogPost;
  index: number;
}

const BlogPostCard: React.FC<BlogPostCardProps> = memo(({ post, index }) => (
  <motion.div
    key={post.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="h-full"
  >
    <BlogCard post={post} />
  </motion.div>
));

BlogPostCard.displayName = 'BlogPostCard';

const LoadingState: React.FC = memo(() => (
  <section className="py-24 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <Loader2 className="w-12 h-12 text-gray-700 animate-spin" />
        <p className="text-gray-500 animate-pulse">최신 AI 트렌드를 불러오는 중...</p>
      </div>
    </div>
  </section>
));

LoadingState.displayName = 'LoadingState';

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = memo(({ error }) => (
  <section className="py-24 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg inline-flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    </div>
  </section>
));

ErrorState.displayName = 'ErrorState';

const EmptyState: React.FC = memo(() => (
  <div className="bg-gray-50 rounded-xl p-12 border border-gray-100 text-center max-w-2xl mx-auto">
    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <p className="text-lg text-gray-600 mb-2">곧 새로운 AI 트렌드로 찾아뵙겠습니다</p>
    <p className="text-gray-500">생성형 AI와 최신 기술 동향을 준비 중입니다</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

const BlogSection: React.FC<BlogSectionProps> = memo(
  ({ posts, isLoading = false, error = null }) => {
    const navigate = useNavigate();
    const displayPosts = Array.isArray(posts) ? posts.slice(0, 3) : [];

    const handleViewAllClick = useCallback(() => {
      navigate('/blog');
    }, [navigate]);

    // Loading state
    if (isLoading) {
      return <LoadingState />;
    }

    // Error state
    if (error) {
      return <ErrorState error={error} />;
    }

    return (
      <section id="blog" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center justify-center gap-2 mb-6">
              <BookOpen className="w-6 h-6 text-gray-700" />
              <h2 className="text-4xl font-bold text-gray-900">AI 트렌드</h2>
            </div>
            <p className="text-xl text-gray-600">최신 AI 기술 동향과 실제 도입 사례를 공유합니다</p>
          </motion.div>

          {/* Content */}
          {displayPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
              >
                {displayPosts.map((post, index) => (
                  <BlogPostCard key={post.id} post={post} index={index} />
                ))}
              </motion.div>

              {posts.length > 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <button
                    onClick={handleViewAllClick}
                    className="group inline-flex items-center px-8 py-4 rounded-lg
                                             bg-white text-gray-700 hover:text-gray-900 
                                             font-semibold shadow-sm hover:shadow-md
                                             border border-gray-200 hover:border-gray-300
                                             transition-all duration-200"
                    aria-label="블로그 전체 글 보기"
                  >
                    <span>전체 트렌드 보기</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    );
  }
);

BlogSection.displayName = 'BlogSection';

export default BlogSection;
