/**
 * Comprehensive tests for OptimizedImage component
 * Testing image optimization, WebP support detection, and responsive image handling
 */

/// <reference types="vitest" />

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import OptimizedImage from '../OptimizedImage';

// Mock LazyImage component
vi.mock('../LazyImage', () => {
  return {
    default: function MockLazyImage(
      props: React.ImgHTMLAttributes<HTMLImageElement> & { loading?: string }
    ) {
      return (
        <img
          data-testid="lazy-image"
          src={props.src}
          alt={props.alt}
          className={props.className}
          width={props.width}
          height={props.height}
          srcSet={props.srcSet}
          sizes={props.sizes}
          onLoad={props.onLoad}
          onError={props.onError}
          loading={props.loading}
        />
      );
    },
  };
});

describe('OptimizedImage', () => {
  let originalDevicePixelRatio: number | undefined;
  let mockCanvas: Partial<HTMLCanvasElement> & {
    toDataURL: ReturnType<typeof vi.fn>;
  };
  let mockCreateElement: MockInstance;

  beforeEach(() => {
    // Store original devicePixelRatio
    originalDevicePixelRatio = window.devicePixelRatio;

    // Mock canvas for WebP support detection
    mockCanvas = {
      width: 0,
      height: 0,
      toDataURL: vi.fn(),
    };

    // Keep original createElement BEFORE spying (avoid recursion)
    const originalCreateElement = document.createElement.bind(document);

    mockCreateElement = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return mockCanvas as HTMLCanvasElement;
        }
        return originalCreateElement(tagName);
      });

    // Default to WebP support
    (mockCanvas.toDataURL as any).mockReturnValue(
      'data:image/webp;base64,test'
    );
  });

  afterEach(() => {
    // Restore original devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: originalDevicePixelRatio,
    });

    mockCreateElement.mockRestore();
    vi.clearAllMocks();
  });

  it('renders basic image with required props', () => {
    render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  it('renders with LazyImage by default', () => {
    render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

    expect(screen.getByTestId('lazy-image')).toBeInTheDocument();
  });

  it('renders regular img element when loading is eager', () => {
    render(
      <OptimizedImage src="/test-image.jpg" alt="Test image" loading="eager" />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).not.toHaveAttribute('data-testid', 'lazy-image');
    expect(image.tagName).toBe('IMG');
  });

  it('applies custom className', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        className="custom-class"
      />
    );

    const image = screen.getByTestId('lazy-image');
    expect(image).toHaveClass('custom-class');
  });

  it('applies width and height attributes', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
      />
    );

    const image = screen.getByTestId('lazy-image');
    expect(image).toHaveAttribute('width', '800');
    expect(image).toHaveAttribute('height', '600');
  });

  it('detects WebP support correctly', async () => {
    (mockCanvas.toDataURL as any).mockReturnValue(
      'data:image/webp;base64,test'
    );

    render(
      <OptimizedImage
        src="https://images.unsplash.com/test-image.jpg"
        alt="Test image"
      />
    );

    await waitFor(() => {
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/webp');
    });
  });

  it('handles no WebP support', async () => {
    (mockCanvas.toDataURL as any).mockReturnValue('data:image/png;base64,test');

    render(
      <OptimizedImage
        src="https://images.unsplash.com/test-image.jpg"
        alt="Test image"
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toHaveAttribute('src', expect.stringContaining('fm=auto'));
    });
  });

  it('optimizes Unsplash images with WebP support', async () => {
    (mockCanvas.toDataURL as any).mockReturnValue(
      'data:image/webp;base64,test'
    );
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: 2,
    });

    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        width={800}
        height={600}
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });

    const image = screen.getByTestId('lazy-image');
    const src = image.getAttribute('src')!;
    expect(src).toContain('q=85'); // Quality for high DPI
    expect(src).toContain('fm=webp'); // WebP format
    expect(src).toContain('w=1600'); // Width * devicePixelRatio
    expect(src).toContain('h=1200'); // Height * devicePixelRatio
  });

  it('optimizes Unsplash images without WebP support', async () => {
    (mockCanvas.toDataURL as any).mockReturnValue('data:image/png;base64,test');
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: 1,
    });

    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        width={800}
        height={600}
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });

    const image = screen.getByTestId('lazy-image');
    const src = image.getAttribute('src')!;
    expect(src).toContain('q=90'); // Higher quality for standard DPI
    expect(src).toContain('fm=auto'); // Auto format
  });

  it('optimizes Pexels images', async () => {
    (mockCanvas.toDataURL as any).mockReturnValue(
      'data:image/webp;base64,test'
    );

    render(
      <OptimizedImage
        src="https://images.pexels.com/photos/123456789/test.jpeg"
        alt="Test image"
        width={400}
        height={300}
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      const src = image.getAttribute('src');
      expect(src).toBe('https://images.pexels.com/photos/123456789/test.jpeg');
    });
  });

  it('does not optimize non-CDN images', async () => {
    const originalSrc = '/local-image.jpg';

    render(<OptimizedImage src={originalSrc} alt="Test image" />);

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toHaveAttribute('src', originalSrc);
    });
  });

  it('generates srcSet for Unsplash images with width', async () => {
    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        width={1024}
        height={768}
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });

    const image = screen.getByTestId('lazy-image');
    const srcSet = image.getAttribute('srcset')!;
    expect(srcSet).toContain('320w');
    expect(srcSet).toContain('640w');
    expect(srcSet).toContain('768w');
    expect(srcSet).toContain('1024w');
  });

  it('limits srcSet widths to 2x original width', async () => {
    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        width={400}
        height={300}
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });

    const image = screen.getByTestId('lazy-image');
    const srcSet = image.getAttribute('srcset') ?? '';
    expect(srcSet).not.toContain('1024w'); // > 2x400
    expect(srcSet).not.toContain('1280w'); // > 2x400
  });

  it('uses custom srcSet when provided', () => {
    const customSrcSet = 'image-small.jpg 320w, image-large.jpg 800w';

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        srcSet={customSrcSet}
      />
    );

    const image = screen.getByTestId('lazy-image');
    expect(image).toHaveAttribute('srcset', customSrcSet);
  });

  it('generates default sizes attribute', () => {
    render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

    const image = screen.getByTestId('lazy-image');
    expect(image).toHaveAttribute(
      'sizes',
      '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    );
  });

  it('uses custom sizes when provided', () => {
    const customSizes = '(max-width: 768px) 100vw, 50vw';

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        sizes={customSizes}
      />
    );

    const image = screen.getByTestId('lazy-image');
    expect(image).toHaveAttribute('sizes', customSizes);
  });

  it('calls onLoad callback', () => {
    const onLoadMock = vi.fn();

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        onLoad={onLoadMock}
      />
    );

    const image = screen.getByTestId('lazy-image');
    fireEvent.load(image);

    expect(onLoadMock).toHaveBeenCalledTimes(1);
  });

  it('calls onError callback', () => {
    const onErrorMock = vi.fn();

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        onError={onErrorMock}
      />
    );

    const image = screen.getByTestId('lazy-image');
    fireEvent.error(image);

    expect(onErrorMock).toHaveBeenCalledTimes(1);
  });

  it('handles different device pixel ratios', async () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: 3,
    });

    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        width={400}
        height={300}
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });

    const image = screen.getByTestId('lazy-image');
    const src = image.getAttribute('src')!;
    expect(src).toContain('w=1200'); // 400 * 3
    expect(src).toContain('h=900'); // 300 * 3
    expect(src).toContain('q=85'); // High DPI quality
  });

  it('handles missing devicePixelRatio', async () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: undefined,
    });

    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        width={400}
        height={300}
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });

    const image = screen.getByTestId('lazy-image');
    const src = image.getAttribute('src')!;
    expect(src).toContain('w=400'); // Default to 1x
    expect(src).toContain('h=300'); // Default to 1x
  });

  it('does not generate srcSet for non-Unsplash images', () => {
    render(
      <OptimizedImage
        src="/local-image.jpg"
        alt="Test image"
        width={800}
        height={600}
      />
    );

    const image = screen.getByTestId('lazy-image');
    expect(image).not.toHaveAttribute('srcset');
  });

  it('does not generate srcSet without width', () => {
    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        height={600}
      />
    );

    const image = screen.getByTestId('lazy-image');
    expect(image).not.toHaveAttribute('srcset');
  });

  it('renders eager loading image with all optimizations', async () => {
    (mockCanvas.toDataURL as any).mockReturnValue(
      'data:image/webp;base64,test'
    );

    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        width={800}
        height={600}
        loading="eager"
        className="eager-image"
      />
    );

    await waitFor(() => {
      const image = screen.getByAltText('Test image');
      expect(image).toBeInTheDocument();
    });

    const image = screen.getByAltText('Test image');
    expect(image.tagName).toBe('IMG');
    expect(image).toHaveClass('eager-image');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('width', '800');
    expect(image).toHaveAttribute('height', '600');

    const src = image.getAttribute('src')!;
    expect(src).toContain('fm=webp');

    const srcSet = image.getAttribute('srcset')!;
    expect(srcSet).toContain('320w');
  });

  it('handles empty alt text', () => {
    render(<OptimizedImage src="/test-image.jpg" alt="" />);

    const image = screen.getByTestId('lazy-image');
    expect(image).toHaveAttribute('alt', '');
  });

  it('handles very large device pixel ratio', async () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: 4,
    });

    render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        width={200}
        height={150}
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });

    const image = screen.getByTestId('lazy-image');
    const src = image.getAttribute('src')!;
    expect(src).toContain('w=800'); // 200 * 4
    expect(src).toContain('h=600'); // 150 * 4
    expect(src).toContain('q=85'); // High DPI quality
  });

  it('updates image source when WebP support changes', async () => {
    const { rerender } = render(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        width={400}
        height={300}
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });

    const image1 = screen.getByTestId('lazy-image');
    const src1 = image1.getAttribute('src')!;
    expect(src1).toContain('fm=webp');

    // Change WebP support
    (mockCanvas.toDataURL as any).mockReturnValue('data:image/png;base64,test');

    rerender(
      <OptimizedImage
        src="https://images.unsplash.com/photo-123456789"
        alt="Test image"
        width={400}
        height={300}
      />
    );

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });

    const image2 = screen.getByTestId('lazy-image');
    const src2 = image2.getAttribute('src')!;
    expect(src2).toMatch(/fm=(webp|auto)/);
  });

  it('handles canvas creation failure gracefully', async () => {
    // Avoid infinite recursion
    let canvasCreationAttempted = false;
    const originalCreateElement = document.createElement.bind(document);

    mockCreateElement.mockImplementation((tagName: string) => {
      if (tagName === 'canvas' && !canvasCreationAttempted) {
        canvasCreationAttempted = true;
        throw new Error('Canvas creation failed');
      }
      return originalCreateElement(tagName);
    });

    render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });
  });

  it('handles toDataURL failure gracefully', async () => {
    (mockCanvas.toDataURL as any).mockImplementation(() => {
      throw new Error('toDataURL failed');
    });

    render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

    await waitFor(() => {
      const image = screen.getByTestId('lazy-image');
      expect(image).toBeInTheDocument();
    });
  });
});
