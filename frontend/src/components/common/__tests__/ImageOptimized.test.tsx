import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ImageOptimized,
  ImageGallery,
  BackgroundImage,
} from '../ImageOptimized';

describe('ImageOptimized', () => {
  it('renders a container div', () => {
    const { container } = render(
      <ImageOptimized src="/test.jpg" alt="Test image" />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with correct alt text on the image when in view', () => {
    render(<ImageOptimized src="/test.jpg" alt="Test image" priority />);

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
  });

  it('applies width and height styles to the container', () => {
    const { container } = render(
      <ImageOptimized src="/test.jpg" alt="Test" width={400} height={300} />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('400px');
    expect(wrapper.style.height).toBe('300px');
  });

  it('uses 100% width and auto height by default', () => {
    const { container } = render(<ImageOptimized src="/test.jpg" alt="Test" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('100%');
    expect(wrapper.style.height).toBe('auto');
  });

  it('renders picture element with WebP source when priority is set', () => {
    const { container } = render(
      <ImageOptimized src="/test.jpg" alt="Test" priority />
    );

    const picture = container.querySelector('picture');
    expect(picture).toBeInTheDocument();

    const source = container.querySelector('source[type="image/webp"]');
    expect(source).toBeInTheDocument();
  });

  it('calls onLoad callback when image loads', () => {
    const onLoad = vi.fn();
    render(
      <ImageOptimized src="/test.jpg" alt="Test" priority onLoad={onLoad} />
    );

    const img = screen.getByAltText('Test');
    fireEvent.load(img);

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('calls onError callback when image fails to load', () => {
    const onError = vi.fn();
    render(
      <ImageOptimized
        src="/broken.jpg"
        alt="Broken"
        priority
        onError={onError}
      />
    );

    const img = screen.getByAltText('Broken');
    fireEvent.error(img);

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('shows error state with message when image fails to load', () => {
    render(<ImageOptimized src="/broken.jpg" alt="Broken" priority />);

    const img = screen.getByAltText('Broken');
    fireEvent.error(img);

    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  it('has displayName set to ImageOptimized', () => {
    expect(ImageOptimized.displayName).toBe('ImageOptimized');
  });
});

describe('ImageGallery', () => {
  const images = [
    { src: '/img1.jpg', alt: 'Image 1' },
    { src: '/img2.jpg', alt: 'Image 2', caption: 'A caption' },
  ];

  it('renders all images in the gallery', () => {
    const { container } = render(<ImageGallery images={images} />);

    // Each image is wrapped in a motion.div
    const items = container.querySelectorAll('.group');
    expect(items.length).toBe(2);
  });

  it('renders captions when provided', () => {
    render(<ImageGallery images={images} />);

    expect(screen.getByText('A caption')).toBeInTheDocument();
  });

  it('has displayName set to ImageGallery', () => {
    expect(ImageGallery.displayName).toBe('ImageGallery');
  });
});

describe('BackgroundImage', () => {
  it('renders children content', () => {
    render(
      <BackgroundImage src="/bg.jpg">
        <p>Overlay content</p>
      </BackgroundImage>
    );

    expect(screen.getByText('Overlay content')).toBeInTheDocument();
  });

  it('renders an overlay when overlay prop is true', () => {
    const { container } = render(
      <BackgroundImage src="/bg.jpg" overlay overlayOpacity={0.7}>
        <p>Content</p>
      </BackgroundImage>
    );

    const overlayDiv = container.querySelector('.bg-black');
    expect(overlayDiv).toBeInTheDocument();
    expect(overlayDiv?.getAttribute('style')).toContain('opacity: 0.7');
  });

  it('does not render overlay by default', () => {
    const { container } = render(
      <BackgroundImage src="/bg.jpg">
        <p>Content</p>
      </BackgroundImage>
    );

    const overlayDiv = container.querySelector('.bg-black');
    expect(overlayDiv).not.toBeInTheDocument();
  });

  it('has displayName set to BackgroundImage', () => {
    expect(BackgroundImage.displayName).toBe('BackgroundImage');
  });
});
