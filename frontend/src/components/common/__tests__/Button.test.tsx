import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Button from '../Button';

// Helper to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  describe('Variants', () => {
    it('applies primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-900');
    });

    it('applies secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('border-gray-300');
    });

    it('applies outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('border-gray-900');
    });

    it('applies ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-gray-700');
    });

    it('applies danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });
  });

  describe('Sizes', () => {
    it('applies medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
    });

    it('applies small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });

    it('applies large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8');
      expect(button).toHaveClass('py-4');
    });
  });

  describe('Full Width', () => {
    it('applies full width when specified', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('does not apply full width by default', () => {
      render(<Button>Normal Width</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Click Events', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('disables the button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Icons', () => {
    const TestIcon = () => <span data-testid="test-icon">🚀</span>;

    it('renders icon on the right by default', () => {
      render(<Button icon={<TestIcon />}>With Icon</Button>);
      const button = screen.getByRole('button');
      const icon = screen.getByTestId('test-icon');
      // Check that icon exists and button contains the expected class structure
      expect(icon).toBeInTheDocument();
      expect(button.innerHTML).toContain('ml-2');
    });

    it('renders icon on the left when specified', () => {
      render(
        <Button icon={<TestIcon />} iconPosition="left">
          With Icon
        </Button>
      );
      const button = screen.getByRole('button');
      const icon = screen.getByTestId('test-icon');
      // Check that icon exists and button contains the expected class structure
      expect(icon).toBeInTheDocument();
      expect(button.innerHTML).toContain('mr-2');
    });

    it('does not render icon container when no icon provided', () => {
      render(<Button>No Icon</Button>);
      const button = screen.getByRole('button');
      expect(button.innerHTML).not.toContain('ml-2');
      expect(button.innerHTML).not.toContain('mr-2');
    });
  });

  describe('Link Rendering', () => {
    it('renders as Link component when "to" prop is provided', () => {
      renderWithRouter(<Button to="/about">About</Button>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/about');
    });

    it('renders as anchor tag when "href" prop is provided', () => {
      render(<Button href="https://example.com">External</Button>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders as button when neither "to" nor "href" are provided', () => {
      render(<Button>Regular Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('combines custom className with default classes', () => {
      render(
        <Button className="custom-class" variant="primary">
          Custom
        </Button>
      );
      const button = screen.getByRole('button');

      // Check that the button has the custom class
      const classAttribute = button.getAttribute('class') || '';
      expect(classAttribute).toContain('custom-class');
      // Check that the button also has default classes
      expect(classAttribute).toContain('bg-gray-900');
      expect(classAttribute).toContain('inline-flex');
    });
  });

  describe('Additional Props', () => {
    it('passes through additional props', () => {
      render(
        <Button data-testid="custom-button" aria-label="Custom Label">
          Props
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });
  });
});
