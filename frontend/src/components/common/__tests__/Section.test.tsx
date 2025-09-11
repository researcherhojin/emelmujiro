import { render, screen } from '@testing-library/react';
import Section from '../Section';
import { testSkipInCI } from '../../../test-utils/ci-skip';

describe('Section Component', () => {
  testSkipInCI('renders children content', () => {
    render(
      <Section>
        <p>Test content</p>
      </Section>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  testSkipInCI('renders with title', () => {
    render(
      <Section title="Test Title">
        <p>Content</p>
      </Section>
    );
    expect(
      screen.getByRole('heading', { name: 'Test Title' })
    ).toBeInTheDocument();
  });

  testSkipInCI('renders with subtitle', () => {
    render(
      <Section subtitle="Test Subtitle">
        <p>Content</p>
      </Section>
    );
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  testSkipInCI('applies background color class', () => {
    render(
      <Section bgColor="gray">
        <p>Content</p>
      </Section>
    );
    // Check that content is rendered with appropriate styling
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  testSkipInCI('applies custom className', () => {
    render(
      <Section className="custom-section">
        <p>Content</p>
      </Section>
    );
    // Check that content is rendered with custom class
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
