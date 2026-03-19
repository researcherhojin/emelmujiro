import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';

// Mock react-i18next BEFORE component imports
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock useNavigate and useParams
const mockNavigate = vi.fn();
let mockParams: Record<string, string> = {};
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// Mock logger
vi.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock AuthContext
const mockUser = { id: 1, email: 'admin@test.com', name: 'Admin', role: 'admin' };
let mockAuthUser: typeof mockUser | null = mockUser;
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    isAuthenticated: !!mockAuthUser,
    loading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// Mock api
const mockCreateBlogPost = vi.fn().mockResolvedValue({ data: { id: 1 } });
const mockUpdateBlogPost = vi.fn().mockResolvedValue({ data: { id: 1 } });
const mockGetBlogPost = vi.fn();
vi.mock('../../../services/api', () => ({
  api: {
    createBlogPost: (...args: unknown[]) => mockCreateBlogPost(...args),
    updateBlogPost: (...args: unknown[]) => mockUpdateBlogPost(...args),
    getBlogPost: (...args: unknown[]) => mockGetBlogPost(...args),
    uploadBlogImage: vi.fn().mockResolvedValue({ data: { url: '/media/test.jpg' } }),
  },
}));

// Mock TipTapEditor to avoid ProseMirror DOM issues
let mockEditorOnChange: ((html: string, text: string) => void) | null = null;
vi.mock('../TipTapEditor', () => ({
  default: function MockTipTapEditor({
    onChange,
  }: {
    content?: string;
    onChange: (html: string, text: string) => void;
  }) {
    mockEditorOnChange = onChange;
    return <div data-testid="tiptap-editor">TipTap Editor</div>;
  },
}));

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: { sanitize: (html: string) => html },
}));

import BlogEditor from '../BlogEditor';
import { MemoryRouter } from 'react-router-dom';

describe('BlogEditor Component', () => {
  const renderEditor = () => {
    return render(
      <MemoryRouter>
        <BlogEditor />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    mockParams = {};
    mockAuthUser = mockUser;
    mockNavigate.mockClear();
    mockCreateBlogPost.mockClear();
    mockUpdateBlogPost.mockClear();
    mockGetBlogPost.mockClear();
    mockEditorOnChange = null;
    vi.clearAllMocks();
  });

  describe('Auth Gate', () => {
    it('shows admin required message when not authenticated', () => {
      mockAuthUser = null;
      renderEditor();
      expect(screen.getByText('blogEditor.adminRequired')).toBeInTheDocument();
    });

    it('shows admin required message for non-admin user', () => {
      mockAuthUser = { ...mockUser, role: 'user' };
      renderEditor();
      expect(screen.getByText('blogEditor.adminRequired')).toBeInTheDocument();
    });

    it('renders editor for admin user', () => {
      renderEditor();
      expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
      expect(screen.queryByText('blogEditor.adminRequired')).not.toBeInTheDocument();
    });
  });

  describe('Editor UI', () => {
    it('renders title input', () => {
      renderEditor();
      expect(screen.getByPlaceholderText('Enter title...')).toBeInTheDocument();
    });

    it('renders category selector', () => {
      renderEditor();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders tags input', () => {
      renderEditor();
      expect(screen.getByPlaceholderText('Tags (comma-separated)')).toBeInTheDocument();
    });

    it('renders TipTap editor', () => {
      renderEditor();
      expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
    });

    it('renders publish/draft toggle', () => {
      renderEditor();
      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    it('toggles publish/draft status', () => {
      renderEditor();
      const toggleBtn = screen.getByText('Published');
      fireEvent.click(toggleBtn);
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('shows error when title is empty', () => {
      renderEditor();
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
      expect(screen.getByRole('alert')).toHaveTextContent('Title is required');
    });

    it('shows error when content is empty', () => {
      renderEditor();
      const titleInput = screen.getByPlaceholderText('Enter title...');
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
      expect(screen.getByRole('alert')).toHaveTextContent('Content is required');
    });

    it('calls createBlogPost API on save with valid data', async () => {
      renderEditor();

      // Fill title
      const titleInput = screen.getByPlaceholderText('Enter title...');
      fireEvent.change(titleInput, { target: { value: 'Test Post' } });

      // Simulate TipTap content change
      act(() => {
        if (mockEditorOnChange) {
          mockEditorOnChange('<p>Test content</p>', 'Test content');
        }
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateBlogPost).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Post',
            content: 'Test content',
            content_html: '<p>Test content</p>',
            category: 'ai',
          })
        );
      });
    });

    it('shows success toast after saving', async () => {
      renderEditor();

      const titleInput = screen.getByPlaceholderText('Enter title...');
      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      act(() => {
        if (mockEditorOnChange) {
          mockEditorOnChange('<p>Content</p>', 'Content');
        }
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Post saved');
      });
    });

    it('shows error toast on API failure', async () => {
      mockCreateBlogPost.mockRejectedValueOnce(new Error('Network error'));
      renderEditor();

      const titleInput = screen.getByPlaceholderText('Enter title...');
      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      act(() => {
        if (mockEditorOnChange) {
          mockEditorOnChange('<p>Content</p>', 'Content');
        }
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to save');
      });
    });
  });

  describe('Preview Mode', () => {
    it('toggles preview mode', () => {
      renderEditor();

      // Editor is visible initially
      expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();

      // Click preview button
      const previewBtn = screen.getByText('blogEditor.preview');
      fireEvent.click(previewBtn);

      // Editor should be hidden, preview shown
      expect(screen.queryByTestId('tiptap-editor')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back to blog list', () => {
      renderEditor();
      const backBtn = screen.getByText('Back');
      fireEvent.click(backBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/blog');
    });
  });

  describe('Edit Mode', () => {
    it('loads existing post in edit mode', async () => {
      mockParams = { id: '42' };
      mockGetBlogPost.mockResolvedValueOnce({
        data: {
          id: 42,
          title: 'Existing Post',
          excerpt: 'Existing desc',
          content: 'Existing text',
          content_html: '<p>Existing HTML</p>',
          category: 'ml',
          tags: ['python', 'ml'],
          image_url: 'https://example.com/img.jpg',
          published: true,
        },
      });

      renderEditor();

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('Enter title...') as HTMLInputElement;
        expect(titleInput.value).toBe('Existing Post');
      });

      expect(mockGetBlogPost).toHaveBeenCalledWith('42');
    });

    it('calls updateBlogPost on save in edit mode', async () => {
      mockParams = { id: '42' };
      mockGetBlogPost.mockResolvedValueOnce({
        data: {
          id: 42,
          title: 'Existing',
          excerpt: 'Desc',
          content: 'Text',
          content_html: '<p>HTML</p>',
          category: 'ai',
          tags: [],
          published: true,
        },
      });

      renderEditor();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing')).toBeInTheDocument();
      });

      // Simulate content
      if (mockEditorOnChange) {
        mockEditorOnChange('<p>Updated</p>', 'Updated');
      }

      const saveButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateBlogPost).toHaveBeenCalledWith(
          '42',
          expect.objectContaining({ title: 'Existing' })
        );
      });
    });
  });
});
