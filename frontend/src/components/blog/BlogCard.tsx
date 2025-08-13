import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/dateFormat';
import type { BlogPost } from '../../types';

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = memo(({ post }) => {
  // Error handling for missing post data
  if (!post) {
    return null;
  }

  const { id, title, excerpt, date, image_url, category } = post;

  return (
    <motion.article
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg
                     transition-all duration-300 h-full flex flex-col"
    >
      <Link to={`/blog/${id}`} className="block flex-grow">
        <div className="relative">
          {image_url ? (
            <img
              src={image_url}
              alt={`${title} 블로그 포스트 썸네일`}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span
              className="inline-block px-3 py-1 text-sm rounded-full font-medium"
              style={{
                backgroundColor: '#E0E7FF',
                color: '#4F46E5',
              }}
            >
              {category}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <time dateTime={date || ''}>{date && formatDate(date)}</time>
          </div>

          <h3
            className="text-xl font-bold text-gray-900 mb-3
                                 line-clamp-2 hover:text-indigo-600 transition-colors"
          >
            {title}
          </h3>

          <p className="text-gray-600 line-clamp-3 mb-4">{excerpt || ''}</p>

          <div className="mt-auto">
            <span
              className="text-indigo-600 text-sm font-medium
                                     hover:text-indigo-700 transition-colors
                                     inline-flex items-center group"
            >
              자세히 보기
              <svg
                className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
});

BlogCard.displayName = 'BlogCard';

export default BlogCard;
