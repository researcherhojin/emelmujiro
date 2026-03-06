import React from 'react';
import { Save, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  image_url: string;
}

interface EditorFormProps {
  formData: FormData;
  categories: string[];
  showPreview: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onSave: () => void;
  onTogglePreview: () => void;
}

const EditorForm: React.FC<EditorFormProps> = ({
  formData,
  categories,
  showPreview,
  onChange,
  onSave,
  onTogglePreview,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">{t('blogEditor.editor')}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('blogEditor.titleLabel')}
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('blogEditor.enterTitle')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('blogEditor.excerptLabel')}
          </label>
          <input
            type="text"
            name="excerpt"
            value={formData.excerpt}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('blogEditor.excerptPlaceholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('blogEditor.categoryLabel')}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('blogEditor.selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('blogEditor.authorLabel')}
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('blogEditor.tagsLabel')}
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('blogEditor.tagsPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('blogEditor.imageUrlLabel')}
          </label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('blogEditor.imageUrlPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('blogEditor.contentLabel')}
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={onChange}
            rows={15}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder={t('blogEditor.contentPlaceholder')}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('common.save')}
          </button>
          <button
            onClick={onTogglePreview}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? t('blogEditor.editor') : t('blogEditor.preview')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorForm;
