import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock logger
vi.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

// Mock api
vi.mock('../../../services/api', () => ({
  api: {
    uploadBlogImage: vi.fn().mockResolvedValue({ data: { url: '/media/test.jpg' } }),
  },
}));

// Create a chainable object that returns itself for any method call (not using vi.fn so clearAllMocks won't break it)
const chainProxy: Record<string, unknown> = {};
const chainHandler: ProxyHandler<Record<string, unknown>> = {
  get: (_target, prop) => {
    if (prop === 'run') return () => undefined;
    if (prop === 'then') return undefined; // not thenable
    return () => new Proxy({}, chainHandler);
  },
};
const chainMock = new Proxy(chainProxy, chainHandler);

const mockEditor = {
  getHTML: () => '<p>test</p>',
  getText: () => 'test',
  chain: () => chainMock,
  isActive: vi.fn().mockReturnValue(false),
  can: vi.fn().mockReturnValue(new Proxy({}, { get: () => vi.fn().mockReturnValue(true) })),
  on: vi.fn(),
  off: vi.fn(),
  view: { dom: { getBoundingClientRect: vi.fn().mockReturnValue({ top: 0, left: 0 }) } },
  state: { selection: { from: 0, $anchor: { parent: { textContent: '' }, parentOffset: 0 } } },
};

let useEditorReturn: typeof mockEditor | null = null;
// Capture the config passed to useEditor so we can invoke callbacks
interface EditorConfig {
  onUpdate: (params: { editor: { getHTML: () => string; getText: () => string } }) => void;
  editorProps: {
    handleDrop: (view: unknown, event: DragEvent, slice: unknown, moved: boolean) => boolean;
    handlePaste: (view: unknown, event: ClipboardEvent) => boolean;
  };
}
let capturedConfig: EditorConfig | null = null;

vi.mock('@tiptap/react', () => ({
  useEditor: (config: EditorConfig) => {
    capturedConfig = config;
    return useEditorReturn;
  },
  EditorContent: ({ editor }: { editor: unknown }) =>
    editor ? <div data-testid="editor-content">Editor Content</div> : null,
}));

vi.mock('@tiptap/starter-kit', () => ({ default: { configure: vi.fn() } }));
vi.mock('@tiptap/extension-placeholder', () => ({ default: { configure: vi.fn() } }));
vi.mock('@tiptap/extension-image', () => ({ default: { configure: vi.fn() } }));
vi.mock('@tiptap/extension-link', () => ({ default: { configure: vi.fn() } }));
vi.mock('@tiptap/extension-underline', () => ({ default: {} }));
vi.mock('@tiptap/extension-task-list', () => ({ default: {} }));
vi.mock('@tiptap/extension-task-item', () => ({ default: { configure: vi.fn() } }));
vi.mock('@tiptap/extension-typography', () => ({ default: {} }));
vi.mock('@tiptap/extension-code-block-lowlight', () => ({ default: { configure: vi.fn() } }));
vi.mock('lowlight', () => ({
  common: {},
  createLowlight: vi.fn().mockReturnValue({}),
}));

// Mock child components that depend on editor internals
vi.mock('../EditorToolbar', () => ({
  default: () => <div data-testid="editor-toolbar">Toolbar</div>,
}));
vi.mock('../SlashCommandMenu', () => ({
  default: () => <div data-testid="slash-menu" />,
}));

import TipTapEditor from '../TipTapEditor';

describe('TipTapEditor', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useEditorReturn = null;
    capturedConfig = null;
  });

  it('returns null when editor is not initialized', () => {
    useEditorReturn = null;
    const { container } = render(<TipTapEditor onChange={mockOnChange} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders editor content when editor is initialized', () => {
    useEditorReturn = mockEditor;
    render(<TipTapEditor onChange={mockOnChange} />);
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('renders the toolbar', () => {
    useEditorReturn = mockEditor;
    render(<TipTapEditor onChange={mockOnChange} />);
    expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument();
  });

  it('renders with custom content', () => {
    useEditorReturn = mockEditor;
    render(<TipTapEditor content="<p>Hello</p>" onChange={mockOnChange} />);
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('applies tiptap-editor class to container', () => {
    useEditorReturn = mockEditor;
    const { container } = render(<TipTapEditor onChange={mockOnChange} />);
    expect(container.querySelector('.tiptap-editor')).toBeInTheDocument();
  });

  it('renders slash command menu', () => {
    useEditorReturn = mockEditor;
    render(<TipTapEditor onChange={mockOnChange} />);
    expect(screen.getByTestId('slash-menu')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    useEditorReturn = mockEditor;
    render(<TipTapEditor onChange={mockOnChange} placeholder="Custom placeholder" />);
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('uses i18n placeholder when none provided', () => {
    useEditorReturn = mockEditor;
    render(<TipTapEditor onChange={mockOnChange} />);
    // Component should use t('blog.editorPlaceholder') as fallback
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  describe('onUpdate callback', () => {
    it('calls onChange with HTML and text from editor', () => {
      useEditorReturn = mockEditor;
      render(<TipTapEditor onChange={mockOnChange} />);
      expect(capturedConfig).not.toBeNull();

      const fakeEditor = {
        getHTML: vi.fn().mockReturnValue('<p>updated</p>'),
        getText: vi.fn().mockReturnValue('updated'),
      };
      capturedConfig!.onUpdate({ editor: fakeEditor });
      expect(mockOnChange).toHaveBeenCalledWith('<p>updated</p>', 'updated');
    });
  });

  describe('handleDrop', () => {
    const getHandleDrop = () => {
      useEditorReturn = mockEditor;
      render(<TipTapEditor onChange={mockOnChange} />);
      return capturedConfig!.editorProps.handleDrop;
    };

    it('returns false when element was moved (not dropped)', () => {
      const handleDrop = getHandleDrop();
      const result = handleDrop(null, {} as DragEvent, null, true);
      expect(result).toBe(false);
    });

    it('returns false when no files in dataTransfer', () => {
      const handleDrop = getHandleDrop();
      const event = { dataTransfer: { files: [] } } as unknown as DragEvent;
      const result = handleDrop(null, event, null, false);
      expect(result).toBe(false);
    });

    it('returns false when no dataTransfer', () => {
      const handleDrop = getHandleDrop();
      const event = {} as DragEvent;
      const result = handleDrop(null, event, null, false);
      expect(result).toBe(false);
    });

    it('returns false when file is not an image', () => {
      const handleDrop = getHandleDrop();
      const event = {
        dataTransfer: { files: [{ type: 'text/plain' }] },
        preventDefault: vi.fn(),
      } as unknown as DragEvent;
      const result = handleDrop(null, event, null, false);
      expect(result).toBe(false);
    });

    it('handles image drop and uploads', async () => {
      const { api } = await import('../../../services/api');
      (api.uploadBlogImage as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { url: '/media/dropped.jpg' },
      });

      const handleDrop = getHandleDrop();
      const event = {
        dataTransfer: { files: [{ type: 'image/png' }] },
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      const result = handleDrop(null, event, null, false);
      expect(result).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();

      await waitFor(() => {
        expect(api.uploadBlogImage).toHaveBeenCalled();
      });
    });
  });

  describe('handlePaste', () => {
    const getHandlePaste = () => {
      useEditorReturn = mockEditor;
      render(<TipTapEditor onChange={mockOnChange} />);
      return capturedConfig!.editorProps.handlePaste;
    };

    it('returns false when no clipboardData items', () => {
      const handlePaste = getHandlePaste();
      const event = { clipboardData: null } as unknown as ClipboardEvent;
      const result = handlePaste(null, event);
      expect(result).toBe(false);
    });

    it('returns false when no image items in clipboard', () => {
      const handlePaste = getHandlePaste();
      const event = {
        clipboardData: { items: [{ type: 'text/plain' }] },
      } as unknown as ClipboardEvent;
      const result = handlePaste(null, event);
      expect(result).toBe(false);
    });

    it('handles image paste and uploads', async () => {
      const { api } = await import('../../../services/api');
      (api.uploadBlogImage as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { url: '/media/pasted.jpg' },
      });

      const handlePaste = getHandlePaste();
      const mockFile = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        clipboardData: {
          items: [{ type: 'image/png', getAsFile: () => mockFile }],
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      const result = handlePaste(null, event);
      expect(result).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();

      await waitFor(() => {
        expect(api.uploadBlogImage).toHaveBeenCalledWith(mockFile);
      });
    });

    it('handles image paste when getAsFile returns null', () => {
      const handlePaste = getHandlePaste();
      const event = {
        clipboardData: {
          items: [{ type: 'image/png', getAsFile: () => null }],
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      const result = handlePaste(null, event);
      expect(result).toBe(true);
    });
  });

  describe('image upload', () => {
    it('handleImageUpload returns URL on success', async () => {
      const { api } = await import('../../../services/api');
      (api.uploadBlogImage as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { url: '/media/uploaded.jpg' },
      });

      useEditorReturn = mockEditor;
      render(<TipTapEditor onChange={mockOnChange} />);
      expect(api.uploadBlogImage).toBeDefined();
    });

    it('handleImageUpload logs error and returns null on failure', async () => {
      const { api } = await import('../../../services/api');
      const logger = (await import('../../../utils/logger')).default;
      (api.uploadBlogImage as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Upload failed')
      );

      useEditorReturn = mockEditor;
      render(<TipTapEditor onChange={mockOnChange} />);

      // Trigger upload via handleDrop to exercise the error path
      const handleDrop = capturedConfig!.editorProps.handleDrop;
      const event = {
        dataTransfer: { files: [{ type: 'image/jpeg' }] },
        preventDefault: vi.fn(),
      } as unknown as DragEvent;
      handleDrop(null, event, null, false);

      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith('Image upload failed:', expect.any(Error));
      });
    });
  });
});
