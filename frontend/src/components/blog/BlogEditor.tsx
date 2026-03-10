import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Download, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { BlogPost } from '../../types';
import logger from '../../utils/logger';
import EditorForm from './EditorForm';
import EditorPreview from './EditorPreview';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const BlogEditor: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    author: '',
    image_url: '',
  });

  useEffect(() => {
    const adminMode = localStorage.getItem('adminMode') === 'true';
    setIsAdmin(adminMode);

    if (searchParams.get('admin') === 'true') {
      localStorage.setItem('adminMode', 'true');
      setIsAdmin(true);
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      showToast(t('blogEditor.titleContentRequired'), 'error');
      return;
    }

    try {
      const newPost: BlogPost = {
        id: Date.now(),
        title: formData.title,
        slug: formData.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
        content: formData.content,
        author: formData.author,
        publishedAt: new Date().toISOString().split('T')[0],
        category: formData.category || t('blogEditor.defaultCategory'),
        tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
        image_url:
          formData.image_url ||
          `https://source.unsplash.com/800x400/?${formData.category || 'technology'}`,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published: true,
      };

      const postsData = localStorage.getItem('customBlogPosts');
      const existingPosts = postsData ? JSON.parse(postsData) : [];
      const updatedPosts = [newPost, ...existingPosts];

      localStorage.setItem('customBlogPosts', JSON.stringify(updatedPosts));
      showToast(t('blogEditor.postSaved'), 'success');

      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: '',
        author: '',
        image_url: '',
      });

      navigate('/blog');
    } catch (error) {
      logger.error('Failed to save post:', error);
      showToast(t('blogEditor.saveError'), 'error');
    }
  };

  const handleExport = () => {
    try {
      const customPosts = localStorage.getItem('customBlogPosts');
      const posts = customPosts ? JSON.parse(customPosts) : [];
      const dataStr = JSON.stringify(posts, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `blog-posts-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      logger.error('Failed to export posts:', error);
      showToast(t('blogEditor.exportError'), 'error');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Invalid file content');
        }

        const posts = JSON.parse(result);
        if (!Array.isArray(posts)) {
          throw new Error('Invalid JSON format: expected array');
        }

        const existingData = localStorage.getItem('customBlogPosts');
        const existingPosts = existingData ? JSON.parse(existingData) : [];
        const mergedPosts = [...posts, ...existingPosts];

        const uniquePosts = mergedPosts.filter(
          (post, index, self) => index === self.findIndex((p) => p.id === post.id)
        );

        localStorage.setItem('customBlogPosts', JSON.stringify(uniquePosts));
        showToast(t('blogEditor.importSuccess', { count: posts.length }), 'success');
      } catch {
        showToast(t('blogEditor.importError'), 'error');
      }
    };
    reader.readAsText(file);
  };

  const categories = [
    'AI',
    t('blogEditor.categories.webDev'),
    t('blogEditor.categories.frontend'),
    'DevOps',
    t('blogEditor.categories.education'),
    t('blogEditor.categories.programming'),
    t('blogEditor.defaultCategory'),
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('blogEditor.adminRequired')}</h2>
          <p className="text-gray-600 mb-8">{t('blogEditor.adminDescription')}</p>
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <p className="text-sm text-gray-500 mb-4">
              {t('blogEditor.adminInstruction')}{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">?admin=true</code>
            </p>
            <button
              onClick={() => navigate('/blog/new?admin=true')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {t('blogEditor.activateAdmin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transition-opacity ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
          role="alert"
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white/80 hover:text-white"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('blogEditor.writePost')}</h1>
          <div className="flex gap-2">
            <label className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              {t('blogEditor.importJSON')}
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={handleExport}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('blogEditor.exportJSON')}
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EditorForm
            formData={formData}
            categories={categories}
            showPreview={showPreview}
            onChange={handleChange}
            onSave={handleSave}
            onTogglePreview={() => setShowPreview(!showPreview)}
          />

          <EditorPreview
            title={formData.title}
            excerpt={formData.excerpt}
            content={formData.content}
            category={formData.category}
            tags={formData.tags}
            imageUrl={formData.image_url}
          />
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">{t('blogEditor.howToUse')}</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• {t('blogEditor.instruction1')}</li>
            <li>• {t('blogEditor.instruction2')}</li>
            <li>• {t('blogEditor.instruction3')}</li>
            <li>
              • {t('blogEditor.instruction4')}{' '}
              <code className="bg-yellow-100 px-1">blogPosts.js</code>
            </li>
            <li>• {t('blogEditor.instruction5')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
