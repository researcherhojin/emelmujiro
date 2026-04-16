import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import { formatDate } from '../../utils/dateFormat';
import { preventImageAction } from '../../utils/imageUtils';
import type { BlogPost } from '../../types';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  index?: number;
}

const BlogCard: React.FC<BlogCardProps> = memo(({ post, featured = false, index = 0 }) => {
  const { t } = useTranslation();
  const { localizedPath } = useLocalizedPath();

  if (!post) {
    return null;
  }

  const { slug, title, description, date, image_url, category } = post;

  if (featured) {
    return (
      <article className="group opacity-0 animate-fade-up">
        <Link to={localizedPath(`/insights/${slug}`)} className="block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
              {image_url ? (
                <img
                  src={image_url}
                  alt={t('blog.thumbnailAlt', { title })}
                  width={1600}
                  height={1000}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none pointer-events-none"
                  loading={index === 0 && featured ? 'eager' : 'lazy'}
                  draggable="false"
                  onContextMenu={preventImageAction}
                  onDragStart={preventImageAction}
                />
              ) : (
                <div className="w-full h-full min-h-[280px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900" />
              )}
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-4">
                {category && (
                  <span className="text-xs font-medium tracking-widest uppercase text-gray-500 dark:text-gray-400">
                    {category}
                  </span>
                )}
                {category && date && (
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                )}
                {date && (
                  <time
                    dateTime={date}
                    className="text-xs tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {formatDate(date)}
                  </time>
                )}
              </div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                {title}
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 mb-6">
                {description || ''}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-300">
                  {t('blog.readMoreDetail')}
                  <span className="inline-block ml-1.5 transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group h-full opacity-0 animate-fade-up-sm">
      <Link to={localizedPath(`/insights/${slug}`)} className="block h-full">
        <div className="h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-500 ease-out hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:border-gray-200 dark:hover:border-gray-700">
          <div className="relative aspect-[16/10] overflow-hidden">
            {image_url ? (
              <img
                src={image_url}
                alt={t('blog.thumbnailAlt', { title })}
                width={1600}
                height={1000}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none pointer-events-none"
                loading={index < 2 ? 'eager' : 'lazy'}
                draggable="false"
                onContextMenu={preventImageAction}
                onDragStart={preventImageAction}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900" />
            )}
          </div>

          <div className="p-6 lg:p-7 flex flex-col flex-grow">
            <div className="flex items-center gap-3 mb-3">
              {category && (
                <span className="text-[11px] font-medium tracking-widest uppercase text-gray-500 dark:text-gray-400">
                  {category}
                </span>
              )}
              {category && date && (
                <span className="w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              )}
              {date && (
                <time
                  dateTime={date}
                  className="text-[11px] tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {formatDate(date)}
                </time>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2.5 leading-snug line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
              {title}
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-5">
              {description || ''}
            </p>

            <div className="mt-auto">
              <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-300">
                {t('blog.readMoreDetail')}
                <span className="inline-block ml-1 transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
});

BlogCard.displayName = 'BlogCard';

export default BlogCard;
