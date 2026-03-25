import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  CodeSquare,
  ImagePlus,
  Link as LinkIcon,
  Undo,
  Redo,
  Minus,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor;
  onImageUpload: (file: File) => Promise<string | null>;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onImageUpload }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = await onImageUpload(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [editor, onImageUpload]
  );

  const handleLinkToggle = useCallback(() => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    setUrlValue('');
    setShowUrlInput(true);
    // Focus the input after state update
    setTimeout(() => urlInputRef.current?.focus(), 0);
  }, [editor]);

  const handleUrlSubmit = useCallback(() => {
    if (urlValue) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: urlValue }).run();
    }
    setShowUrlInput(false);
    setUrlValue('');
  }, [editor, urlValue]);

  const handleUrlKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUrlSubmit();
      } else if (e.key === 'Escape') {
        setShowUrlInput(false);
        setUrlValue('');
        editor.chain().focus().run();
      }
    },
    [handleUrlSubmit, editor]
  );

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active
        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
    }`;

  const divider = <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {/* Text formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        title={t('blogEditor.toolbar.bold')}
        aria-label={t('blogEditor.toolbar.bold')}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        title={t('blogEditor.toolbar.italic')}
        aria-label={t('blogEditor.toolbar.italic')}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive('underline'))}
        title={t('blogEditor.toolbar.underline')}
        aria-label={t('blogEditor.toolbar.underline')}
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive('strike'))}
        title={t('blogEditor.toolbar.strikethrough')}
        aria-label={t('blogEditor.toolbar.strikethrough')}
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btnClass(editor.isActive('code'))}
        title={t('blogEditor.toolbar.inlineCode')}
        aria-label={t('blogEditor.toolbar.inlineCode')}
      >
        <Code className="w-4 h-4" />
      </button>

      {divider}

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive('heading', { level: 1 }))}
        title={t('blogEditor.toolbar.heading1')}
        aria-label={t('blogEditor.toolbar.heading1')}
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
        title={t('blogEditor.toolbar.heading2')}
        aria-label={t('blogEditor.toolbar.heading2')}
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive('heading', { level: 3 }))}
        title={t('blogEditor.toolbar.heading3')}
        aria-label={t('blogEditor.toolbar.heading3')}
      >
        <Heading3 className="w-4 h-4" />
      </button>

      {divider}

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        title={t('blogEditor.toolbar.bulletList')}
        aria-label={t('blogEditor.toolbar.bulletList')}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        title={t('blogEditor.toolbar.orderedList')}
        aria-label={t('blogEditor.toolbar.orderedList')}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={btnClass(editor.isActive('taskList'))}
        title={t('blogEditor.toolbar.taskList')}
        aria-label={t('blogEditor.toolbar.taskList')}
      >
        <ListChecks className="w-4 h-4" />
      </button>

      {divider}

      {/* Block elements */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        title={t('blogEditor.toolbar.blockquote')}
        aria-label={t('blogEditor.toolbar.blockquote')}
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btnClass(editor.isActive('codeBlock'))}
        title={t('blogEditor.toolbar.codeBlock')}
        aria-label={t('blogEditor.toolbar.codeBlock')}
      >
        <CodeSquare className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={btnClass(false)}
        title={t('blogEditor.toolbar.horizontalRule')}
        aria-label={t('blogEditor.toolbar.horizontalRule')}
      >
        <Minus className="w-4 h-4" />
      </button>

      {divider}

      {/* Link & Image */}
      <button
        type="button"
        onClick={handleLinkToggle}
        className={btnClass(editor.isActive('link'))}
        title={t('blogEditor.toolbar.link')}
        aria-label={t('blogEditor.toolbar.link')}
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      {showUrlInput && (
        <div className="flex items-center gap-1 ml-1">
          <input
            ref={urlInputRef}
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            onBlur={handleUrlSubmit}
            placeholder={t('blogEditor.toolbar.enterUrl')}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
            aria-label={t('blogEditor.toolbar.enterUrl')}
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={btnClass(false)}
        title={t('blogEditor.toolbar.image')}
        aria-label={t('blogEditor.toolbar.image')}
      >
        <ImagePlus className="w-4 h-4" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {divider}

      {/* Undo/Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${btnClass(false)} disabled:opacity-30`}
        title={t('blogEditor.toolbar.undo')}
        aria-label={t('blogEditor.toolbar.undo')}
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${btnClass(false)} disabled:opacity-30`}
        title={t('blogEditor.toolbar.redo')}
        aria-label={t('blogEditor.toolbar.redo')}
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EditorToolbar;
