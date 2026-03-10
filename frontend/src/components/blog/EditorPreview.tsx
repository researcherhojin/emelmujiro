import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';

interface EditorPreviewProps {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  imageUrl: string;
}

const EditorPreview: React.FC<EditorPreviewProps> = ({
  title,
  excerpt,
  content,
  category,
  tags,
  imageUrl,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">{t('blogEditor.preview')}</h2>

      <article className="prose prose-indigo max-w-none">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" />
        )}

        {category && (
          <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full mb-2">
            {category}
          </span>
        )}

        <h1>{title || t('blogEditor.enterTitle')}</h1>

        {tags && (
          <div className="flex gap-2 mb-4">
            {tags.split(',').map((tag) => (
              <span key={tag.trim()} className="text-sm bg-gray-100 px-2 py-1 rounded">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {excerpt && <p className="text-gray-600 italic">{excerpt}</p>}

        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content || `*${t('blogEditor.contentFallback')}*`}
        </ReactMarkdown>
      </article>
    </div>
  );
};

export default memo(EditorPreview);
