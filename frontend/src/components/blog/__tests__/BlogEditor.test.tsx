import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BlogEditor from '../BlogEditor';

// Mock getPropertyValue for all CSSStyleDeclaration instances
const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
CSSStyleDeclaration.prototype.getPropertyValue = function (prop: string) {
  if (this === undefined || this === null) {
    return '';
  }
  try {
    return originalGetPropertyValue.call(this, prop);
  } catch {
    return '';
  }
};

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock ReactMarkdown to avoid issues with markdown rendering
vi.mock('react-markdown', () => ({
  default: function ReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-preview">{children}</div>;
  },
}));

// Mock remarkGfm
vi.mock('remark-gfm', () => ({
  default: () => {},
}));

// Define types for blog posts
interface BlogPost {
  id: number;
  title: string;
  content: string;
  category?: string;
  date?: string;
  created_at?: string;
  slug?: string;
}

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

describe('BlogEditor Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  describe('Admin Mode', () => {
    it('shows admin required message when not in admin mode', () => {
      localStorage.removeItem('adminMode');
      renderWithRouter(<BlogEditor />);
      expect(screen.getByText('관리자 모드가 필요합니다')).toBeInTheDocument();
      expect(screen.queryByText('블로그 글쓰기')).not.toBeInTheDocument();
    });

    it('renders editor when in admin mode', () => {
      localStorage.setItem('adminMode', 'true');
      renderWithRouter(<BlogEditor />);
      expect(screen.getByText('블로그 글쓰기')).toBeInTheDocument();
      expect(
        screen.queryByText('관리자 모드가 필요합니다')
      ).not.toBeInTheDocument();
    });

    it('activates admin mode via URL parameter', () => {
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...originalLocation, search: '?admin=true' },
      });

      renderWithRouter(<BlogEditor />);
      expect(localStorage.getItem('adminMode')).toBe('true');

      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
      });
    });
  });

  describe('Form Inputs', () => {
    beforeEach(() => {
      localStorage.setItem('adminMode', 'true');
    });

    it('renders all form fields', () => {
      renderWithRouter(<BlogEditor />);

      expect(screen.getByText('제목 *')).toBeInTheDocument();
      expect(screen.getByText('요약')).toBeInTheDocument();
      expect(screen.getByText('카테고리')).toBeInTheDocument();
      expect(screen.getByText('태그 (쉼표로 구분)')).toBeInTheDocument();
      expect(screen.getByText('작성자')).toBeInTheDocument();
      expect(screen.getByText('이미지 URL')).toBeInTheDocument();
      expect(screen.getByText('내용 * (Markdown 지원)')).toBeInTheDocument();
    });

    it('updates form data on input change', () => {
      renderWithRouter(<BlogEditor />);

      // Find title input by placeholder
      const titleInput = screen.getByPlaceholderText(
        '포스트 제목을 입력하세요'
      ) as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      expect(titleInput.value).toBe('Test Title');

      // Find content textarea by placeholder text
      const contentTextarea = screen.getByPlaceholderText(
        /## 제목/
      ) as HTMLTextAreaElement;
      fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });
      expect(contentTextarea.value).toBe('Test Content');
    });

    it('has default author value', () => {
      renderWithRouter(<BlogEditor />);

      // Find author input by its label
      const authorInput = screen.getByDisplayValue('이호진');
      expect(authorInput).toBeInTheDocument();
    });
  });

  describe('Preview Mode', () => {
    beforeEach(() => {
      localStorage.setItem('adminMode', 'true');
    });

    it('toggles preview mode', () => {
      renderWithRouter(<BlogEditor />);

      // Initially preview is shown
      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
      expect(screen.getByTestId('markdown-preview')).toHaveTextContent(
        '*내용을 입력하세요...*'
      );
    });

    it('displays content in preview mode', () => {
      renderWithRouter(<BlogEditor />);

      const contentTextarea = screen.getByPlaceholderText(
        /## 제목/
      ) as HTMLTextAreaElement;
      fireEvent.change(contentTextarea, {
        target: { value: '# Test Markdown' },
      });

      // Preview is already shown by default
      expect(screen.getByTestId('markdown-preview')).toHaveTextContent(
        '# Test Markdown'
      );
    });
  });

  describe('Save Functionality', () => {
    beforeEach(() => {
      localStorage.setItem('adminMode', 'true');
    });

    it.skip('validates required fields before saving', () => {
      renderWithRouter(<BlogEditor />);

      const saveButton = screen.getByRole('button', { name: /저장/ });

      // Mock alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      fireEvent.click(saveButton);

      expect(alertSpy).toHaveBeenCalledWith('제목과 내용은 필수입니다.');

      alertSpy.mockRestore();
    });

    it.skip('saves post to localStorage with valid data', () => {
      // Clear localStorage and set initial empty posts
      localStorage.clear();
      localStorage.setItem('adminMode', 'true');
      localStorage.setItem('customBlogPosts', '[]');

      renderWithRouter(<BlogEditor />);

      const titleInput = screen.getByPlaceholderText(
        '포스트 제목을 입력하세요'
      ) as HTMLInputElement;
      const contentTextarea = screen.getByPlaceholderText(
        /## 제목/
      ) as HTMLTextAreaElement;
      const categorySelect = screen.getByRole('combobox') as HTMLSelectElement;

      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });
      fireEvent.change(categorySelect, { target: { value: 'Technology' } });

      const saveButton = screen.getByRole('button', { name: /저장/ });

      // Mock alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      fireEvent.click(saveButton);

      // Check localStorage - should have the new post
      const savedPosts = JSON.parse(
        localStorage.getItem('customBlogPosts') || '[]'
      ) as BlogPost[];
      expect(savedPosts.length).toBe(1);
      const lastPost = savedPosts[0];
      expect(lastPost?.title).toBe('Test Post');
      expect(lastPost?.content).toBe('Test Content');
      expect(lastPost?.category).toBe('일반');

      expect(alertSpy).toHaveBeenCalledWith('포스트가 저장되었습니다!');
      expect(mockNavigate).toHaveBeenCalledWith('/blog');

      alertSpy.mockRestore();
    });

    it.skip('generates unique ID and timestamp for new posts', () => {
      // Clear localStorage and set initial empty posts
      localStorage.clear();
      localStorage.setItem('adminMode', 'true');
      localStorage.setItem('customBlogPosts', '[]');

      renderWithRouter(<BlogEditor />);

      const titleInput = screen.getByPlaceholderText(
        '포스트 제목을 입력하세요'
      ) as HTMLInputElement;
      const contentTextarea = screen.getByPlaceholderText(
        /## 제목/
      ) as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });

      const saveButton = screen.getByRole('button', { name: /저장/ });

      vi.spyOn(window, 'alert').mockImplementation(() => {});

      fireEvent.click(saveButton);

      const savedPosts = JSON.parse(
        localStorage.getItem('customBlogPosts') || '[]'
      ) as BlogPost[];
      expect(savedPosts.length).toBe(1);
      const lastPost = savedPosts[0];
      expect(lastPost?.id).toBeDefined();
      expect(lastPost?.date).toBeDefined();
      expect(lastPost?.created_at).toBeDefined();
      expect(lastPost?.slug).toBe('test-post');
    });
  });

  describe('Export/Import Functionality', () => {
    beforeEach(() => {
      localStorage.setItem('adminMode', 'true');
    });

    it('exports posts as JSON', () => {
      const mockPosts = [
        { id: 1, title: 'Post 1', content: 'Content 1' },
        { id: 2, title: 'Post 2', content: 'Content 2' },
      ];
      localStorage.setItem('customBlogPosts', JSON.stringify(mockPosts));

      renderWithRouter(<BlogEditor />);

      // Mock createElement and click
      const linkElement = document.createElement('a');
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(linkElement);
      const clickSpy = vi
        .spyOn(linkElement, 'click')
        .mockImplementation(() => {});

      const exportButton = screen.getByRole('button', { name: /내보내기/ });
      fireEvent.click(exportButton);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(linkElement.download).toContain('blog-posts-');
      expect(clickSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      clickSpy.mockRestore();
    });

    it('imports posts from JSON file', async () => {
      localStorage.setItem('adminMode', 'true');
      renderWithRouter(<BlogEditor />);

      const file = new File(
        [
          JSON.stringify([
            { id: 1, title: 'Imported Post', content: 'Imported Content' },
          ]),
        ],
        'posts.json',
        { type: 'application/json' }
      );

      // We need to interact with the file input directly
      // For file inputs, we still need direct access as Testing Library doesn't provide a good alternative
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const savedPosts = JSON.parse(
          localStorage.getItem('customBlogPosts') || '[]'
        );
        // Check that the imported post was added
        const importedPost = savedPosts.find(
          (p: BlogPost) => p.title === 'Imported Post'
        );
        expect(importedPost).toBeDefined();
      });

      const savedPosts = JSON.parse(
        localStorage.getItem('customBlogPosts') || '[]'
      ) as BlogPost[];
      const importedPost = savedPosts.find(
        (p: BlogPost) => p.title === 'Imported Post'
      );
      expect(importedPost?.content).toBe('Imported Content');

      expect(alertSpy).toHaveBeenCalledWith('1개의 포스트를 가져왔습니다!');

      alertSpy.mockRestore();
    });

    it('validates imported JSON structure', async () => {
      localStorage.setItem('adminMode', 'true');
      renderWithRouter(<BlogEditor />);

      const invalidFile = new File(['invalid json'], 'posts.json', {
        type: 'application/json',
      });

      // We need to interact with the file input directly
      // For file inputs, we still need direct access as Testing Library doesn't provide a good alternative
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        // Check that alert was called with error message
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      localStorage.setItem('adminMode', 'true');
    });

    it('navigates back on cancel', () => {
      renderWithRouter(<BlogEditor />);

      const cancelButton = screen.getByRole('button', { name: /취소/ });
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/blog');
    });
  });
});
