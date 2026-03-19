import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

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

// Mock @tiptap/react — useEditor returns null initially (standard TipTap behavior)
// Create a chainable mock that returns itself for any method call
const createChainMock = (): Record<string, unknown> => {
  const mock: Record<string, unknown> = { run: vi.fn() };
  return new Proxy(mock, {
    get: (target, prop) => {
      if (prop === 'run') return target.run;
      // Return a function that returns the proxy itself (chainable)
      return vi.fn().mockReturnValue(mock);
    },
  });
};

const chainMock = createChainMock();

const mockEditor = {
  getHTML: vi.fn().mockReturnValue('<p>test</p>'),
  getText: vi.fn().mockReturnValue('test'),
  chain: vi.fn().mockReturnValue(chainMock),
  isActive: vi.fn().mockReturnValue(false),
  can: vi.fn().mockReturnValue(new Proxy({}, { get: () => vi.fn().mockReturnValue(true) })),
  on: vi.fn(),
  off: vi.fn(),
  view: { dom: { getBoundingClientRect: vi.fn().mockReturnValue({ top: 0, left: 0 }) } },
  state: { selection: { from: 0, $anchor: { parent: { textContent: '' }, parentOffset: 0 } } },
};

let useEditorReturn: typeof mockEditor | null = null;

vi.mock('@tiptap/react', () => ({
  useEditor: () => useEditorReturn,
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
});
