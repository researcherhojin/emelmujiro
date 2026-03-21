import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  CodeSquare,
  ImagePlus,
  Minus,
} from 'lucide-react';

interface SlashMenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: Editor) => void;
}

interface SlashCommandMenuProps {
  editor: Editor;
  onImageUpload: (file: File) => Promise<string | null>;
}

const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({ editor, onImageUpload }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const items: SlashMenuItem[] = [
    {
      title: 'Heading 1',
      description: t('blog.slashCommand.heading1'),
      icon: <Heading1 className="w-5 h-5" />,
      command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: 'Heading 2',
      description: t('blog.slashCommand.heading2'),
      icon: <Heading2 className="w-5 h-5" />,
      command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: 'Heading 3',
      description: t('blog.slashCommand.heading3'),
      icon: <Heading3 className="w-5 h-5" />,
      command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: 'Bullet List',
      description: t('blog.slashCommand.bulletList'),
      icon: <List className="w-5 h-5" />,
      command: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      title: 'Ordered List',
      description: t('blog.slashCommand.orderedList'),
      icon: <ListOrdered className="w-5 h-5" />,
      command: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
      title: 'Task List',
      description: t('blog.slashCommand.taskList'),
      icon: <ListChecks className="w-5 h-5" />,
      command: (e) => e.chain().focus().toggleTaskList().run(),
    },
    {
      title: 'Blockquote',
      description: t('blog.slashCommand.blockquote'),
      icon: <Quote className="w-5 h-5" />,
      command: (e) => e.chain().focus().toggleBlockquote().run(),
    },
    {
      title: 'Code Block',
      description: t('blog.slashCommand.codeBlock'),
      icon: <CodeSquare className="w-5 h-5" />,
      command: (e) => e.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: 'Image',
      description: t('blog.slashCommand.image'),
      icon: <ImagePlus className="w-5 h-5" />,
      command: () => fileInputRef.current?.click(),
    },
    {
      title: 'Divider',
      description: t('blog.slashCommand.divider'),
      icon: <Minus className="w-5 h-5" />,
      command: (e) => e.chain().focus().setHorizontalRule().run(),
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) || item.description.includes(query)
  );

  const executeCommand = useCallback(
    (item: SlashMenuItem) => {
      // Delete the slash and query text
      const { from } = editor.state.selection;
      const slashStart = from - query.length - 1;
      editor.chain().focus().deleteRange({ from: slashStart, to: from }).run();
      item.command(editor);
      setIsOpen(false);
      setQuery('');
    },
    [editor, query]
  );

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { selection } = editor.state;
      const { $anchor } = selection;
      const textBefore = $anchor.parent.textContent.slice(0, $anchor.parentOffset);
      const slashMatch = textBefore.match(/\/([^\s]*)$/);

      if (slashMatch) {
        setQuery(slashMatch[1]);
        setSelectedIndex(0);
        setIsOpen(true);

        // Position the menu near the cursor
        const coords = editor.view.coordsAtPos(selection.from);
        const editorRect = editor.view.dom.getBoundingClientRect();
        setPosition({
          top: coords.bottom - editorRect.top + 8,
          left: coords.left - editorRect.left,
        });
      } else {
        setIsOpen(false);
        setQuery('');
      }
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          executeCommand(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, selectedIndex, filteredItems, executeCommand]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Delete the slash command text
    const { from } = editor.state.selection;
    const slashStart = from - query.length - 1;
    editor.chain().focus().deleteRange({ from: slashStart, to: from }).run();

    const url = await onImageUpload(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setIsOpen(false);
    setQuery('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen || filteredItems.length === 0)
    return (
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <div
        ref={menuRef}
        className="absolute z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 max-h-72 overflow-y-auto"
        style={{ top: position.top, left: position.left }}
      >
        {filteredItems.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
              index === selectedIndex
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => executeCommand(item)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className="flex-shrink-0 text-gray-400 dark:text-gray-500">{item.icon}</span>
            <div>
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default SlashCommandMenu;
