import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Card from '../Card';
import { itSkipInCI } from '../../../test-utils/ci-skip';

describe('Card Component', () => {
  itSkipInCI('renders children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  describe('Base Styles', () => {
    itSkipInCI('applies base classes', () => {
      render(<Card data-testid="test-card">Content</Card>);
      const card = screen.getByTestId('test-card');

      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('border-2');
      expect(card).toHaveClass('border-gray-200');
      expect(card).toHaveClass('rounded-2xl');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-300');
    });

    itSkipInCI('applies default padding', () => {
      render(<Card data-testid="test-card">Content</Card>);
      const card = screen.getByTestId('test-card');

      expect(card).toHaveClass('p-8');
    });

    itSkipInCI('applies custom padding', () => {
      render(
        <Card data-testid="test-card" padding="p-4">
          Content
        </Card>
      );
      const card = screen.getByTestId('test-card');

      expect(card).toHaveClass('p-4');
      expect(card).not.toHaveClass('p-8');
    });
  });

  describe('Hover Effects', () => {
    itSkipInCI('applies hover classes by default', () => {
      render(<Card data-testid="test-card">Content</Card>);
      const card = screen.getByTestId('test-card');

      expect(card).toHaveClass('hover:border-gray-300');
      expect(card).toHaveClass('hover:shadow-xl');
      expect(card).toHaveClass('hover:-translate-y-1');
      expect(card).toHaveClass('cursor-pointer');
    });

    itSkipInCI('does not apply hover classes when hover is false', () => {
      render(
        <Card data-testid="test-card" hover={false}>
          Content
        </Card>
      );
      const card = screen.getByTestId('test-card');

      expect(card).not.toHaveClass('hover:border-gray-300');
      expect(card).not.toHaveClass('hover:shadow-xl');
      expect(card).not.toHaveClass('hover:-translate-y-1');
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Custom ClassName', () => {
    itSkipInCI('applies custom className', () => {
      render(
        <Card data-testid="test-card" className="custom-class">
          Content
        </Card>
      );
      const card = screen.getByTestId('test-card');

      expect(card).toHaveClass('custom-class');
    });

    itSkipInCI('combines custom className with base classes', () => {
      render(
        <Card data-testid="test-card" className="custom-class">
          Content
        </Card>
      );
      const card = screen.getByTestId('test-card');

      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('border-2');
    });
  });

  describe('Additional Props', () => {
    itSkipInCI('passes through additional props', () => {
      const handleClick = vi.fn();
      render(
        <Card data-testid="custom-card" onClick={handleClick} role="article">
          Content
        </Card>
      );
      const card = screen.getByTestId('custom-card');

      expect(card).toHaveAttribute('data-testid', 'custom-card');
      expect(card).toHaveAttribute('role', 'article');

      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complex Content', () => {
    itSkipInCI('renders complex nested content', () => {
      render(
        <Card>
          <header>
            <h2>Title</h2>
          </header>
          <section>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </section>
          <footer>
            <button>Action</button>
          </footer>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Action' })
      ).toBeInTheDocument();
    });
  });
});
