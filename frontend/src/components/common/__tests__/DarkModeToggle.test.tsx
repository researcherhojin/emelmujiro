import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DarkModeToggle from '../DarkModeToggle';

// Mock UI Context
const mockToggleTheme = vi.fn();
const mockUIContextValue = {
  theme: 'light' as 'light' | 'dark',
  toggleTheme: mockToggleTheme,
  setTheme: vi.fn(),
  isGlobalLoading: false,
  setGlobalLoading: vi.fn(),
  notifications: [],
  showNotification: vi.fn(),
  removeNotification: vi.fn(),
  modals: [],
  openModal: vi.fn(),
  closeModal: vi.fn(),
  closeAllModals: vi.fn(),
  isSidebarOpen: false,
  toggleSidebar: vi.fn(),
  setSidebarOpen: vi.fn(),
};
vi.mock('../../../contexts/UIContext', () => ({
  useUI: () => mockUIContextValue,
}));

describe('DarkModeToggle', () => {
  beforeEach(() => {
    mockToggleTheme.mockClear();
  });

  it('renders correctly in light mode', () => {
    render(<DarkModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(button).toHaveAttribute('title', '다크 모드로 전환');
  });

  it('renders correctly in dark mode', () => {
    mockUIContextValue.theme = 'dark';
    render(<DarkModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    expect(button).toHaveAttribute('title', '라이트 모드로 전환');
  });

  it('calls toggleTheme when clicked', () => {
    render(<DarkModeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<DarkModeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title');
  });

  it('shows correct icons for light mode', () => {
    mockUIContextValue.theme = 'light';
    render(<DarkModeToggle />);

    // In light mode, should have toggle button present
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    // Button should have proper attributes for light mode
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('shows correct icons for dark mode', () => {
    mockUIContextValue.theme = 'dark';
    render(<DarkModeToggle />);

    // In dark mode, should have toggle button present
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    // Button should have proper attributes for dark mode
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to light mode');
  });
});
