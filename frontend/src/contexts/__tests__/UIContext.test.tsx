import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UIProvider, useUI } from '../UIContext';

// Test component to consume the context
const TestComponent: React.FC = () => {
  const { theme, isSidebarOpen, isGlobalLoading, toggleTheme, toggleSidebar, setGlobalLoading } =
    useUI();

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="sidebar-open">{isSidebarOpen.toString()}</div>
      <div data-testid="loading">{isGlobalLoading.toString()}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <button onClick={() => setGlobalLoading(true)}>Set Loading True</button>
      <button onClick={() => setGlobalLoading(false)}>Set Loading False</button>
    </div>
  );
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('UIContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('provides initial state', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  test('toggles theme', async () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const toggleButton = screen.getByText('Toggle Theme');

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

    // Toggle back
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  test('toggles sidebar state', async () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const toggleSidebarButton = screen.getByText('Toggle Sidebar');

    await act(async () => {
      fireEvent.click(toggleSidebarButton);
    });

    expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');

    await act(async () => {
      fireEvent.click(toggleSidebarButton);
    });

    expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');
  });

  test('sets loading state', async () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const setLoadingTrueButton = screen.getByText('Set Loading True');
    const setLoadingFalseButton = screen.getByText('Set Loading False');

    await act(async () => {
      fireEvent.click(setLoadingTrueButton);
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await act(async () => {
      fireEvent.click(setLoadingFalseButton);
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  test('loads saved theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme');
  });

  test('handles invalid theme in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-theme');

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // Should fallback to default 'light' theme
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  test('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUI must be used within a UIProvider');

    consoleSpy.mockRestore();
  });
});
