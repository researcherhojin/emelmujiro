import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import LazyImage from '../LazyImage';

describe('LazyImage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders placeholder initially without img element', () => {
    render(
      <LazyImage
        src="test.jpg"
        alt="Test image"
        className="image-class"
        placeholderClassName="placeholder-class"
      />
    );

    // Image should not be rendered yet (lazy loading),
    const img = screen.queryByAltText('Test image');
    expect(img).not.toBeInTheDocument();
  });

  it('creates IntersectionObserver on mount', () => {
    // Mock to capture the IntersectionObserver instance
    const mockObserve = vi.fn();
    global.IntersectionObserver = vi
      .fn()
      .mockImplementation((_callback, _options) => ({
        observe: mockObserve,
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }));

    render(<LazyImage src="test.jpg" alt="Test image" />);

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );
    expect(mockObserve).toHaveBeenCalled();
  });

  it('renders with priority prop immediately', () => {
    render(<LazyImage src="test.jpg" alt="Priority image" priority={true} />);

    const img = screen.getByAltText('Priority image');
    // Priority images should have src set immediately
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test.jpg');
  });

  it('renders with custom className', () => {
    render(
      <LazyImage
        src="test.jpg"
        alt="Test image"
        priority={true}
        className="custom-class"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('custom-class');
  });

  it('passes through additional img props when rendered', () => {
    render(
      <LazyImage
        src="test.jpg"
        alt="Test image"
        width="200"
        height="100"
        data-testid="lazy-img"
        priority={true}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('width', '200');
    expect(img).toHaveAttribute('height', '100');
    expect(img).toHaveAttribute('data-testid', 'lazy-img');
  });
});
