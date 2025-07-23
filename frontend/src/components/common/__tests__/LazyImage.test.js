import React from 'react';
import { render, screen } from '@testing-library/react';
import LazyImage from '../LazyImage';

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  
  observe = jest.fn((element) => {
    // Simulate immediate intersection
    this.callback([{ isIntersecting: true, target: element }]);
  });
  
  unobserve = jest.fn();
  disconnect = jest.fn();
}

window.IntersectionObserver = MockIntersectionObserver;

describe('LazyImage Component', () => {
  beforeEach(() => {
    // Clear any previous mocks
    jest.clearAllMocks();
  });

  test('renders container div and placeholder initially', () => {
    const { container } = render(
      <LazyImage 
        src="test.jpg" 
        alt="Test alt text"
      />
    );

    // Check container exists
    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('relative');

    // Check placeholder exists (image not loaded yet)
    const placeholder = wrapper.querySelector('.animate-pulse');
    expect(placeholder).toBeInTheDocument();
  });

  test('renders container with relative class', () => {
    const { container } = render(
      <LazyImage 
        src="test.jpg" 
        alt="Test"
        className="custom-image-class"
      />
    );

    const wrapper = container.firstChild;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper).toHaveClass('relative');
  });

  test('loads image when it intersects', () => {
    render(
      <LazyImage 
        src="test.jpg" 
        alt="Test image"
      />
    );

    // Image should be loaded immediately due to mock
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test.jpg');
  });
});