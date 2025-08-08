import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogEditor from '../BlogEditor';

// Mock react-markdown and remark-gfm
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-preview">{children}</div>;
  };
});

jest.mock('remark-gfm', () => {
  return function remarkGfm() {
    return {};
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  default: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
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
    it('renders nothing when not in admin mode', () => {
      renderWithRouter(<BlogEditor />);
      expect(screen.queryByText('블로그 글쓰기')).not.toBeInTheDocument();
    });

    it('renders editor when in admin mode', () => {
      localStorage.setItem('adminMode', 'true');
      renderWithRouter(<BlogEditor />);
      expect(screen.getByText('블로그 글쓰기')).toBeInTheDocument();
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

      // Find inputs by placeholder or name attribute
      const titleInput = screen.getByRole('textbox', { name: '' }) as HTMLInputElement;
      const textareas = screen.getAllByRole('textbox');
      const contentTextarea = textareas.find(
        el => (el as HTMLTextAreaElement).rows > 1
      ) as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });

      expect(titleInput.value).toBe('Test Title');
      expect(contentTextarea.value).toBe('Test Content');
    });

    it('has default author value', () => {
      renderWithRouter(<BlogEditor />);
      // Find all input elements and check for the one with default value
      const inputs = screen.getAllByRole('textbox');
      const authorInput = inputs.find(input => (input as HTMLInputElement).value === '이호진');
      expect(authorInput).toBeDefined();
      expect((authorInput as HTMLInputElement).value).toBe('이호진');
    });
  });

  describe('Preview Mode', () => {
    beforeEach(() => {
      localStorage.setItem('adminMode', 'true');
    });

    it('toggles preview mode', () => {
      renderWithRouter(<BlogEditor />);

      const previewButton = screen.getByRole('button', { name: /미리보기/ });

      // Initially preview is hidden
      expect(screen.queryByText('미리보기')).toBeInTheDocument();
      expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();

      // Show preview
      fireEvent.click(previewButton);
      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();

      // Hide preview
      fireEvent.click(previewButton);
      expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
    });

    it('displays content in preview mode', () => {
      renderWithRouter(<BlogEditor />);

      const contentTextarea = screen.getByLabelText('내용') as HTMLTextAreaElement;
      fireEvent.change(contentTextarea, { target: { value: '# Test Markdown' } });

      const previewButton = screen.getByRole('button', { name: /미리보기/ });
      fireEvent.click(previewButton);

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
      renderWithRouter(<BlogEditor />);

      const inputs = screen.getAllByRole('textbox');
      const titleInput = inputs[0] as HTMLInputElement;
      const contentTextarea = inputs.find(
        el => (el as HTMLTextAreaElement).rows > 1
      ) as HTMLTextAreaElement;
      const categorySelect = screen.getByRole('combobox') as HTMLSelectElement;

      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });
      fireEvent.change(categorySelect, { target: { value: 'Technology' } });

      const saveButton = screen.getByRole('button', { name: /저장/ });

      // Mock alert and confirm
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      fireEvent.click(saveButton);

      const savedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
      expect(savedPosts).toHaveLength(1);
      expect(savedPosts[0].title).toBe('Test Post');
      expect(savedPosts[0].content).toBe('Test Content');
      expect(savedPosts[0].category).toBe('Technology');

      expect(alertSpy).toHaveBeenCalledWith('글이 저장되었습니다.');
      expect(mockNavigate).toHaveBeenCalledWith('/blog');

      alertSpy.mockRestore();
    });

    it('generates unique ID and timestamp for new posts', () => {
      localStorage.setItem('adminMode', 'true');
      renderWithRouter(<BlogEditor />);

      const inputs = screen.getAllByRole('textbox');
      const titleInput = inputs[0] as HTMLInputElement;
      const contentTextarea = inputs.find(
        el => (el as HTMLTextAreaElement).rows > 1
      ) as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      fireEvent.change(contentTextarea, { target: { value: 'Test Content' } });

      const saveButton = screen.getByRole('button', { name: /저장/ });

      jest.spyOn(window, 'alert').mockImplementation();

      fireEvent.click(saveButton);

      const savedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
      expect(savedPosts[0].id).toBeDefined();
      expect(savedPosts[0].date).toBeDefined();
      expect(savedPosts[0].created_at).toBeDefined();
      expect(savedPosts[0].slug).toBe('test-post');
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
        expect(savedPosts).toHaveLength(1);
        expect(savedPosts[0].title).toBe('Imported Post');
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
        expect(alertSpy).toHaveBeenCalledWith('유효한 JSON 파일이 아닙니다.');
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
