import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import logger from '../../utils/logger';
import TipTapEditor from './TipTapEditor';
import Toast from '../common/Toast';
import DOMPurify from 'dompurify';

interface PostMeta {
  title: string;
  description: string;
  category: string;
  tags: string;
  image_url: string;
  is_published: boolean;
}

const CATEGORY_KEYS = [
  { value: 'ai', labelKey: 'blogEditor.categoryAi' },
  { value: 'ml', labelKey: 'blogEditor.categoryMl' },
  { value: 'ds', labelKey: 'blogEditor.categoryDs' },
  { value: 'nlp', labelKey: 'blogEditor.categoryNlp' },
  { value: 'cv', labelKey: 'blogEditor.categoryCv' },
  { value: 'rl', labelKey: 'blogEditor.categoryRl' },
  { value: 'education', labelKey: 'blogEditor.categoryEducation' },
  { value: 'career', labelKey: 'blogEditor.categoryCareer' },
  { value: 'project', labelKey: 'blogEditor.categoryProject' },
  { value: 'other', labelKey: 'blogEditor.categoryOther' },
] as const;

const BlogEditor: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { localizedNavigate } = useLocalizedPath();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [meta, setMeta] = useState<PostMeta>({
    title: '',
    description: '',
    category: 'ai',
    tags: '',
    image_url: '',
    is_published: true,
  });
  const [apiCategories, setApiCategories] = useState<{ value: string; label: string }[] | null>(
    null
  );
  const [contentHtml, setContentHtml] = useState('');
  const [contentText, setContentText] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const { toast, showToast } = useToast();

  // Fetch categories from API (fallback to hardcoded list)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.getBlogCategories();
        const data = response.data;
        if (data.length > 0) {
          setApiCategories(
            data.map((cat: string | { name: string; slug: string }) =>
              typeof cat === 'string'
                ? { value: cat, label: cat }
                : { value: cat.slug, label: cat.name }
            )
          );
        }
      } catch {
        // Keep fallback categories
      }
    };
    loadCategories();
  }, []);

  // Load existing post in edit mode
  useEffect(() => {
    if (!isEditMode || !id) return;
    const loadPost = async () => {
      try {
        const response = await api.getBlogPost(id);
        const post = response.data;
        setMeta({
          title: post.title,
          description: post.excerpt || '',
          category: post.category || 'ai',
          tags: post.tags?.join(', ') || '',
          image_url: post.image_url || '',
          is_published: post.published ?? true,
        });
        setInitialContent(post.content_html || post.content || '');
        setContentHtml(post.content_html || '');
        setContentText(post.content || '');
      } catch (error) {
        logger.error('Failed to load post:', error);
        showToast(t('blogEditor.loadError', 'Failed to load post'), 'error');
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id, isEditMode, showToast, t]);

  const handleMetaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMeta((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = useCallback((html: string, text: string) => {
    setContentHtml(html);
    setContentText(text);
  }, []);

  const handleSave = async () => {
    if (!meta.title.trim()) {
      showToast(t('blogEditor.titleRequired', 'Title is required'), 'error');
      return;
    }
    if (!contentText.trim()) {
      showToast(t('blogEditor.contentRequired', 'Content is required'), 'error');
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: meta.title,
        description: meta.description || contentText.substring(0, 150),
        content: contentText,
        content_html: contentHtml,
        category: meta.category,
        tags: meta.tags
          ? meta.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        image_url: meta.image_url || null,
        is_published: meta.is_published,
      };

      if (isEditMode && id) {
        await api.updateBlogPost(id, data);
        showToast(t('blogEditor.postUpdated', 'Post updated'), 'success');
      } else {
        await api.createBlogPost(data);
        showToast(t('blogEditor.postSaved', 'Post saved'), 'success');
      }

      setTimeout(() => localizedNavigate('/blog'), 500);
    } catch (error) {
      logger.error('Failed to save post:', error);
      showToast(t('blogEditor.saveError', 'Failed to save'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Auth check: admin only
  const isAdmin = user?.role === 'admin';
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            {t('blogEditor.adminRequired')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('blogEditor.adminDescription')}
          </p>
          <button
            onClick={() => localizedNavigate('/blog')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            {t('blogEditor.backToBlog', 'Back to Blog')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => localizedNavigate('/blog')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back', 'Back')}</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMeta((prev) => ({ ...prev, is_published: !prev.is_published }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                meta.is_published
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}
            >
              {meta.is_published ? (
                <>
                  <Eye className="w-4 h-4" />
                  {t('blogEditor.published', 'Published')}
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  {t('blogEditor.draft', 'Draft')}
                </>
              )}
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {showPreview ? t('blogEditor.editor') : t('blogEditor.preview')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving
                ? t('blogEditor.saving', 'Saving...')
                : isEditMode
                  ? t('blogEditor.update', 'Update')
                  : t('common.save')}
            </button>
          </div>
        </div>

        {showPreview ? (
          /* Preview Mode */
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            {meta.image_url && (
              <img
                src={meta.image_url}
                alt={meta.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
            )}
            <h1 className="text-3xl font-bold mb-4 dark:text-white">{meta.title || 'Untitled'}</h1>
            {meta.description && (
              <p className="text-gray-500 dark:text-gray-400 mb-6">{meta.description}</p>
            )}
            <div
              className="prose prose-lg prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentHtml) }}
            />
          </div>
        ) : (
          /* Editor Mode */
          <div className="space-y-6">
            {/* Title */}
            <input
              type="text"
              name="title"
              value={meta.title}
              onChange={handleMetaChange}
              placeholder={t('blogEditor.enterTitle', 'Enter title...')}
              className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600 dark:text-white"
            />

            {/* Metadata row */}
            <div className="flex flex-wrap gap-3">
              <select
                name="category"
                value={meta.category}
                onChange={handleMetaChange}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {apiCategories
                  ? apiCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))
                  : CATEGORY_KEYS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {t(cat.labelKey)}
                      </option>
                    ))}
              </select>
              <input
                type="text"
                name="tags"
                value={meta.tags}
                onChange={handleMetaChange}
                placeholder={t('blogEditor.tagsPlaceholder', 'Tags (comma-separated)')}
                className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description / Excerpt */}
            <textarea
              name="description"
              value={meta.description}
              onChange={handleMetaChange}
              placeholder={t(
                'blogEditor.excerptPlaceholder',
                'Brief description (auto-generated if empty)'
              )}
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            {/* Image URL */}
            <input
              type="text"
              name="image_url"
              value={meta.image_url}
              onChange={handleMetaChange}
              placeholder={t('blogEditor.imageUrlPlaceholder', 'Cover image URL (optional)')}
              className="w-full px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* TipTap Editor */}
            <TipTapEditor content={initialContent} onChange={handleEditorChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;
