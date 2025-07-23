import React from 'react';
import { render, screen } from '@testing-library/react';
import LazyImage from '../LazyImage';

describe('LazyImage Component', () => {
  test('renders with alt text', () => {
    render(
      <LazyImage 
        src="test.jpg" 
        alt="Test alt text"
      />
    );

    const img = screen.getByRole('img', { hidden: true });
    expect(img).toHaveAttribute('alt', 'Test alt text');
  });

  test('applies custom className to container', () => {
    render(
      <LazyImage 
        src="test.jpg" 
        alt="Test"
        className="custom-image-class"
      />
    );

    const container = screen.getByRole('img', { hidden: true }).parentElement;
    expect(container).toHaveClass('custom-image-class');
  });
});