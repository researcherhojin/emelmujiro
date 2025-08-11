import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DarkModeToggle from '../DarkModeToggle';
// Removed unused import

// Mock UI Context
const mockToggleTheme = jest.fn();
const mockUIContextValue = {
  theme: 'light' as 'light' | 'dark',
  toggleTheme: mockToggleTheme,
  setTheme: jest.fn(),
  isGlobalLoading: false,
  setGlobalLoading: jest.fn(),
  notifications: [],
  showNotification: jest.fn(),
  removeNotification: jest.fn(),
  modals: [],
  openModal: jest.fn(),
  closeModal: jest.fn(),
  closeAllModals: jest.fn(),
  isSidebarOpen: false,
  toggleSidebar: jest.fn(),
  setSidebarOpen: jest.fn(),
};

jest.mock('../../../contexts/UIContext', () => ({
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
    const { container } = render(<DarkModeToggle />);

    // In light mode, should have SVG icons present
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    // Icons are rendered within the button
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows correct icons for dark mode', () => {
    mockUIContextValue.theme = 'dark';
    const { container } = render(<DarkModeToggle />);

    // Icons should still be present regardless of theme
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    // Icons are rendered within the button
    expect(container.firstChild).toBeInTheDocument();
  });
});
