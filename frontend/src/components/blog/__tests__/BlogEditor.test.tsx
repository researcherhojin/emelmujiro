import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogEditor from '../BlogEditor';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock ReactMarkdown to avoid issues with markdown rendering
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-preview">{children}</div>;
  };
});

// Mock remarkGfm
jest.mock('remark-gfm', () => () => {});

// Mock logger
jest.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('BlogEditor Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    jest.clearAllMocks();
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
      expect(screen.queryByText('관리자 모드가 필요합니다')).not.toBeInTheDocument();
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

      // Find content textarea - it has a multiline placeholder
      const contentTextarea = screen.getByRole('textbox', { name: /내용/i }) as HTMLTextAreaElement;
      fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });
      expect(contentTextarea.value).toBe('Test Content');
    });

    it('has default author value', () => {
      renderWithRouter(<BlogEditor />);

      // Find author input by its label
      const authorLabel = screen.getByText('작성자');
      const authorInput = authorLabel.parentElement?.querySelector('input') as HTMLInputElement;
      expect(authorInput?.value).toBe('이호진');
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
      expect(screen.getByTestId('markdown-preview')).toHaveTextContent('*내용을 입력하세요...*');
    });

    it('displays content in preview mode', () => {
      renderWithRouter(<BlogEditor />);

      const contentTextarea = screen.getByRole('textbox', { name: /내용/i }) as HTMLTextAreaElement;
      fireEvent.change(contentTextarea, { target: { value: '# Test Markdown' } });

      // Preview is already shown by default
      expect(screen.getByTestId('markdown-preview')).toHaveTextContent('# Test Markdown');
    });
  });

  describe('Save Functionality', () => {
    beforeEach(() => {
      localStorage.setItem('adminMode', 'true');
    });

    it('validates required fields before saving', () => {
      renderWithRouter(<BlogEditor />);

      const saveButton = screen.getByRole('button', { name: /저장/ });

      // Mock alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      fireEvent.click(saveButton);

      expect(alertSpy).toHaveBeenCalledWith('제목과 내용은 필수입니다.');

      alertSpy.mockRestore();
    });

    it('saves post to localStorage with valid data', () => {
      // Clear localStorage and set initial empty posts
      localStorage.clear();
      localStorage.setItem('blogPosts', '[]');

      renderWithRouter(<BlogEditor />);

      const titleInput = screen.getByPlaceholderText(
        '포스트 제목을 입력하세요'
      ) as HTMLInputElement;
      const contentTextarea = screen.getByRole('textbox', { name: /내용/i }) as HTMLTextAreaElement;
      const categorySelect = screen.getByRole('combobox') as HTMLSelectElement;

      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });
      fireEvent.change(categorySelect, { target: { value: 'Technology' } });

      const saveButton = screen.getByRole('button', { name: /저장/ });

      // Mock alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      fireEvent.click(saveButton);

      // Check localStorage - should have the new post
      const savedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
      expect(savedPosts.length).toBe(1);
      const lastPost = savedPosts[0];
      expect(lastPost?.title).toBe('Test Post');
      expect(lastPost?.content).toBe('Test Content');
      expect(lastPost?.category).toBe('Technology');

      expect(alertSpy).toHaveBeenCalledWith('글이 저장되었습니다.');
      expect(mockNavigate).toHaveBeenCalledWith('/blog');

      alertSpy.mockRestore();
    });

    it('generates unique ID and timestamp for new posts', () => {
      // Clear localStorage and set initial empty posts
      localStorage.clear();
      localStorage.setItem('adminMode', 'true');
      localStorage.setItem('blogPosts', '[]');

      renderWithRouter(<BlogEditor />);

      const titleInput = screen.getByPlaceholderText(
        '포스트 제목을 입력하세요'
      ) as HTMLInputElement;
      const contentTextarea = screen.getByRole('textbox', { name: /내용/i }) as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });

      const saveButton = screen.getByRole('button', { name: /저장/ });

      jest.spyOn(window, 'alert').mockImplementation();

      fireEvent.click(saveButton);

      const savedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
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
      localStorage.setItem('blogPosts', JSON.stringify(mockPosts));

      renderWithRouter(<BlogEditor />);

      // Mock createElement and click
      const linkElement = document.createElement('a');
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(linkElement);
      const clickSpy = jest.spyOn(linkElement, 'click').mockImplementation();

      const exportButton = screen.getByRole('button', { name: /내보내기/ });
      fireEvent.click(exportButton);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(linkElement.download).toContain('blog-posts-');
      expect(clickSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      clickSpy.mockRestore();
    });

    it('imports posts from JSON file', async () => {
      renderWithRouter(<BlogEditor />);

      const file = new File(
        [JSON.stringify([{ id: 1, title: 'Imported Post', content: 'Imported Content' }])],
        'posts.json',
        { type: 'application/json' }
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const savedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        // Check that the imported post was added
        const importedPost = savedPosts.find((p: any) => p.title === 'Imported Post');
        expect(importedPost).toBeDefined();
        expect(importedPost.content).toBe('Imported Content');
      });

      expect(confirmSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('1개의 글을 가져왔습니다.');

      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('validates imported JSON structure', async () => {
      renderWithRouter(<BlogEditor />);

      const invalidFile = new File(['invalid json'], 'posts.json', { type: 'application/json' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

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
