import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { api } from '../../services/api';
import logger from '../../utils/logger';
import EditorToolbar from './EditorToolbar';
import SlashCommandMenu from './SlashCommandMenu';
import './TipTapEditor.css';

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content?: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content = '',
  onChange,
  placeholder = "내용을 입력하세요... '/' 를 입력하면 블록을 추가할 수 있습니다",
}) => {
  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    try {
      const response = await api.uploadBlogImage(file);
      return response.data.url;
    } catch (error) {
      logger.error('Image upload failed:', error);
      return null;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-xl max-w-full' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 dark:text-blue-400 underline underline-offset-4' },
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-lg prose-gray dark:prose-invert max-w-none min-h-[400px] px-4 py-3 focus:outline-none',
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const file = files[0];
        if (!file.type.startsWith('image/')) return false;
        event.preventDefault();
        handleImageUpload(file).then((url) => {
          if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        });
        return true;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file).then((url) => {
                if (url && editor) {
                  editor.chain().focus().setImage({ src: url }).run();
                }
              });
            }
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML(), e.getText());
    },
  });

  if (!editor) return null;

  return (
    <div className="tiptap-editor border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
      <div className="relative">
        <EditorContent editor={editor} />
        <SlashCommandMenu editor={editor} onImageUpload={handleImageUpload} />
      </div>
    </div>
  );
};

export default TipTapEditor;
