import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  OptimizedButton,
  OptimizedCard,
  OptimizedListItem,
  OptimizedInput,
  OptimizedBadge,
} from '../OptimizedComponents';

describe('OptimizedButton', () => {
  it('renders children content', () => {
    render(<OptimizedButton>Click me</OptimizedButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<OptimizedButton onClick={onClick}>Click</OptimizedButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <OptimizedButton onClick={onClick} disabled>
        Disabled
      </OptimizedButton>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disables the button when loading', () => {
    render(<OptimizedButton loading>Loading</OptimizedButton>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('renders a spinner SVG when loading', () => {
    const { container } = render(
      <OptimizedButton loading>Loading</OptimizedButton>
    );

    const spinner = container.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has displayName set to OptimizedButton', () => {
    expect(OptimizedButton.displayName).toBe('OptimizedButton');
  });
});

describe('OptimizedCard', () => {
  it('renders title and description', () => {
    render(<OptimizedCard title="Card Title" description="Card description" />);

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
  });

  it('renders an image when provided', () => {
    render(
      <OptimizedCard title="With Image" image="https://example.com/img.jpg" />
    );

    const img = screen.getByAltText('With Image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('renders children content', () => {
    render(
      <OptimizedCard>
        <span>Child content</span>
      </OptimizedCard>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('applies button role when onClick is provided', () => {
    const onClick = vi.fn();
    const { container } = render(
      <OptimizedCard title="Clickable" onClick={onClick} />
    );

    const card = container.querySelector('[role="button"]');
    expect(card).toBeInTheDocument();
  });

  it('calls onClick on Enter key press', () => {
    const onClick = vi.fn();
    const { container } = render(
      <OptimizedCard title="Keyboard" onClick={onClick} />
    );

    const card = container.querySelector('[role="button"]')!;
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on Space key press', () => {
    const onClick = vi.fn();
    const { container } = render(
      <OptimizedCard title="Keyboard" onClick={onClick} />
    );

    const card = container.querySelector('[role="button"]')!;
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not add keyboard handler when no onClick', () => {
    const { container } = render(<OptimizedCard title="No Click" />);

    const card = container.firstChild;
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');
  });

  it('has displayName set to OptimizedCard', () => {
    expect(OptimizedCard.displayName).toBe('OptimizedCard');
  });
});

describe('OptimizedListItem', () => {
  it('renders title and subtitle', () => {
    render(
      <OptimizedListItem id="1" title="Item Title" subtitle="Item subtitle" />
    );

    expect(screen.getByText('Item Title')).toBeInTheDocument();
    expect(screen.getByText('Item subtitle')).toBeInTheDocument();
  });

  it('calls onClick with the item id when clicked', () => {
    const onClick = vi.fn();
    render(
      <OptimizedListItem id="item-1" title="Test Item" onClick={onClick} />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith('item-1');
  });

  it('renders icon when provided', () => {
    render(
      <OptimizedListItem
        id="1"
        title="With Icon"
        icon={<span data-testid="icon">Icon</span>}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies selected styling when selected', () => {
    const { container } = render(
      <OptimizedListItem id="1" title="Selected" selected />
    );

    const item = container.querySelector('[aria-selected="true"]');
    expect(item).toBeInTheDocument();
  });

  it('handles keyboard Enter key press', () => {
    const onClick = vi.fn();
    render(<OptimizedListItem id="2" title="Keyboard" onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith('2');
  });

  it('has displayName set to OptimizedListItem', () => {
    expect(OptimizedListItem.displayName).toBe('OptimizedListItem');
  });
});

describe('OptimizedInput', () => {
  it('renders with label and required indicator', () => {
    const onChange = vi.fn();
    render(
      <OptimizedInput value="" onChange={onChange} label="Email" required />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange with the new value', () => {
    const onChange = vi.fn();
    render(
      <OptimizedInput value="" onChange={onChange} placeholder="Type here" />
    );

    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('displays error message when error is provided', () => {
    const onChange = vi.fn();
    render(
      <OptimizedInput value="" onChange={onChange} error="Field is required" />
    );

    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    const onChange = vi.fn();
    render(
      <OptimizedInput value="" onChange={onChange} error="Error" label="Test" />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables the input when disabled prop is true', () => {
    const onChange = vi.fn();
    render(<OptimizedInput value="" onChange={onChange} disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('has displayName set to OptimizedInput', () => {
    expect(OptimizedInput.displayName).toBe('OptimizedInput');
  });
});

describe('OptimizedBadge', () => {
  it('renders the badge text', () => {
    render(<OptimizedBadge text="New" />);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies primary variant classes by default', () => {
    render(<OptimizedBadge text="Primary" />);

    const badge = screen.getByText('Primary');
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });

  it('applies danger variant classes', () => {
    render(<OptimizedBadge text="Danger" variant="danger" />);

    const badge = screen.getByText('Danger');
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-800');
  });

  it('applies small size classes', () => {
    render(<OptimizedBadge text="Small" size="sm" />);

    const badge = screen.getByText('Small');
    expect(badge).toHaveClass('text-xs');
  });

  it('has displayName set to OptimizedBadge', () => {
    expect(OptimizedBadge.displayName).toBe('OptimizedBadge');
  });
});
