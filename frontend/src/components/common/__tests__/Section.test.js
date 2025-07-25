import React from 'react';
import { render, screen } from '@testing-library/react';
import Section from '../Section';

describe('Section Component', () => {
  test('renders children content', () => {
    render(
      <Section>
        <p>Test content</p>
      </Section>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders with title', () => {
    render(
      <Section title="Test Title">
        <p>Content</p>
      </Section>
    );
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });

  test('renders with subtitle', () => {
    render(
      <Section subtitle="Test Subtitle">
        <p>Content</p>
      </Section>
    );
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  test('applies background color class', () => {
    const { container } = render(
      <Section bgColor="gray">
        <p>Content</p>
      </Section>
    );
    const section = container.firstChild;
    expect(section.className).toContain('bg-gray-50');
  });

  test('applies custom className', () => {
    const { container } = render(
      <Section className="custom-section">
        <p>Content</p>
      </Section>
    );
    const section = container.firstChild;
    expect(section).toHaveClass('custom-section');
  });
});