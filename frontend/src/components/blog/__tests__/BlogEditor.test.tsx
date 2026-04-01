import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Override global i18n mock — this test needs custom t() behavior
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
const mockGetBlogCategories = vi.fn().mockResolvedValue({ data: [] });
vi.mock('../../../services/api', () => ({
  api: {
    createBlogPost: (...args: unknown[]) => mockCreateBlogPost(...args),
    updateBlogPost: (...args: unknown[]) => mockUpdateBlogPost(...args),
    getBlogPost: (...args: unknown[]) => mockGetBlogPost(...args),
    getBlogCategories: (...args: unknown[]) => mockGetBlogCategories(...args),
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
    mockGetBlogCategories.mockClear();
    mockGetBlogCategories.mockResolvedValue({ data: [] });
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

    it('navigates to /blog after 500ms timeout on successful save (line 159)', async () => {
      vi.useFakeTimers();

      renderEditor();

      const titleInput = screen.getByPlaceholderText('Enter title...');
      fireEvent.change(titleInput, { target: { value: 'Timeout Post' } });
      act(() => {
        if (mockEditorOnChange) {
          mockEditorOnChange('<p>Content</p>', 'Content');
        }
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Flush the async createBlogPost promise
      await vi.advanceTimersByTimeAsync(0);

      expect(mockCreateBlogPost).toHaveBeenCalled();

      // Navigate should not have been called yet (setTimeout 500ms pending)
      expect(mockNavigate).not.toHaveBeenCalledWith('/insights');

      // Advance timers past the 500ms setTimeout
      await vi.advanceTimersByTimeAsync(500);

      // localizedNavigate('/blog') -> navigate('/insights') for Korean default
      expect(mockNavigate).toHaveBeenCalledWith('/insights');

      vi.useRealTimers();
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

    it('shows image and description in preview when set', () => {
      renderEditor();

      // Set image URL
      const imageInput = screen.getByPlaceholderText('Cover image URL (optional)');
      fireEvent.change(imageInput, {
        target: { value: 'https://example.com/image.jpg' },
      });

      // Set description
      const descInput = screen.getByPlaceholderText('Brief description (auto-generated if empty)');
      fireEvent.change(descInput, { target: { value: 'A description' } });

      // Set title
      const titleInput = screen.getByPlaceholderText('Enter title...');
      fireEvent.change(titleInput, { target: { value: 'Preview Title' } });

      // Switch to preview
      const previewBtn = screen.getByText('blogEditor.preview');
      fireEvent.click(previewBtn);

      // Image should be rendered
      const img = screen.getByAltText('Preview Title');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');

      // Description should be rendered
      expect(screen.getByText('A description')).toBeInTheDocument();
    });

    it('does not show image or description in preview when empty', () => {
      renderEditor();

      // Switch to preview without setting image or description
      const previewBtn = screen.getByText('blogEditor.preview');
      fireEvent.click(previewBtn);

      // No image should be rendered
      expect(screen.queryByRole('img')).not.toBeInTheDocument();

      // Title should show "Untitled" as fallback
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back to blog list', () => {
      renderEditor();
      const backBtn = screen.getByText('Back');
      fireEvent.click(backBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/insights');
    });
  });

  describe('Edit Mode', () => {
    it('loads existing post in edit mode', async () => {
      mockParams = { id: '42' };
      mockGetBlogPost.mockResolvedValueOnce({
        data: {
          id: 42,
          title: 'Existing Post',
          description: 'Existing desc',
          content: 'Existing text',
          content_html: '<p>Existing HTML</p>',
          category: 'ml',
          tags: ['python', 'ml'],
          image_url: 'https://example.com/img.jpg',
          is_published: true,
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
          description: 'Desc',
          content: 'Text',
          content_html: '<p>HTML</p>',
          category: 'ai',
          tags: [],
          is_published: true,
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

    it('handles post data with missing optional fields in edit mode', async () => {
      mockParams = { id: '50' };
      mockGetBlogPost.mockResolvedValueOnce({
        data: {
          id: 50,
          title: 'Minimal Post',
          // No excerpt, no category, no tags, no image_url, no content_html, no published field
          content: 'Plain text only',
        },
      });

      renderEditor();

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('Enter title...') as HTMLInputElement;
        expect(titleInput.value).toBe('Minimal Post');
      });
    });

    it('shows error toast when loading post fails in edit mode', async () => {
      mockParams = { id: '99' };
      mockGetBlogPost.mockRejectedValueOnce(new Error('Not found'));

      renderEditor();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to load post');
      });
    });

    it('falls back to content when content_html is empty', async () => {
      mockParams = { id: '60' };
      mockGetBlogPost.mockResolvedValueOnce({
        data: {
          id: 60,
          title: 'Plain Content Post',
          content: 'Only plain text here',
          content_html: '',
          category: 'ai',
          tags: [],
          is_published: true,
        },
      });

      renderEditor();

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('Enter title...') as HTMLInputElement;
        expect(titleInput.value).toBe('Plain Content Post');
      });

      expect(mockGetBlogPost).toHaveBeenCalledWith('60');
    });

    it('falls back to empty string when both content_html and content are empty', async () => {
      mockParams = { id: '61' };
      mockGetBlogPost.mockResolvedValueOnce({
        data: {
          id: 61,
          title: 'Empty Content Post',
          content: '',
          content_html: '',
          category: 'ai',
          tags: [],
          is_published: true,
        },
      });

      renderEditor();

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('Enter title...') as HTMLInputElement;
        expect(titleInput.value).toBe('Empty Content Post');
      });

      expect(mockGetBlogPost).toHaveBeenCalledWith('61');
    });
  });

  describe('Categories', () => {
    it('loads categories from API with slug/name objects', async () => {
      mockGetBlogCategories.mockResolvedValueOnce({
        data: [
          { slug: 'deep-learning', name: 'Deep Learning' },
          { slug: 'web-dev', name: 'Web Development' },
        ],
      });

      renderEditor();

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        const options = select.querySelectorAll('option');
        const optionTexts = Array.from(options).map((o) => o.textContent);
        expect(optionTexts).toContain('Deep Learning');
        expect(optionTexts).toContain('Web Development');
      });
    });

    it('loads categories from API with category objects', async () => {
      mockGetBlogCategories.mockResolvedValueOnce({
        data: [
          { id: 1, name: 'Python', slug: 'python', count: 3 },
          { id: 2, name: 'JavaScript', slug: 'javascript', count: 5 },
        ],
      });

      renderEditor();

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        const options = select.querySelectorAll('option');
        const optionTexts = Array.from(options).map((o) => o.textContent);
        expect(optionTexts).toContain('Python');
        expect(optionTexts).toContain('JavaScript');
      });
    });
  });

  describe('Admin Gate Actions', () => {
    it('navigates to blog when back button is clicked on admin gate', () => {
      mockAuthUser = null;
      renderEditor();
      const backBtn = screen.getByText('Back to Blog');
      fireEvent.click(backBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/insights');
    });
  });

  describe('Toast Dismiss', () => {
    it('toast auto-dismisses after timeout', async () => {
      vi.useFakeTimers();
      renderEditor();

      // Trigger a toast by trying to save with empty title
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Toast should appear
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Advance past the auto-dismiss timer (3000ms default)
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Toast should be dismissed
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('Tag Processing', () => {
    it('sends tags as comma-separated array when saving', async () => {
      renderEditor();

      const titleInput = screen.getByPlaceholderText('Enter title...');
      fireEvent.change(titleInput, { target: { value: 'Tagged Post' } });

      const tagsInput = screen.getByPlaceholderText('Tags (comma-separated)');
      fireEvent.change(tagsInput, { target: { value: 'python, ml, , ai' } });

      act(() => {
        if (mockEditorOnChange) {
          mockEditorOnChange('<p>Content</p>', 'Content');
        }
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateBlogPost).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['python', 'ml', 'ai'],
          })
        );
      });
    });
  });
});
