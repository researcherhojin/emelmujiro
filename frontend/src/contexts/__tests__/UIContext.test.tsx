import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
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
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia - make sure it returns the mock object properly
const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('UIContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    fireEvent.click(toggleButton);

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

    // Toggle back
    fireEvent.click(toggleButton);

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

    fireEvent.click(toggleSidebarButton);

    expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');

    fireEvent.click(toggleSidebarButton);

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

    fireEvent.click(setLoadingTrueButton);

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    fireEvent.click(setLoadingFalseButton);

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
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUI must be used within a UIProvider');

    consoleSpy.mockRestore();
  });

  test('uses system dark preference when no saved theme', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  test('persists theme to localStorage and toggles dark mode', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // Toggle to dark — should persist to localStorage
    fireEvent.click(screen.getByText('Toggle Theme'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

    // Toggle back to light — should persist to localStorage
    fireEvent.click(screen.getByText('Toggle Theme'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  test('updates meta theme-color for dark theme', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', '#ffffff');
    document.head.appendChild(meta);

    mockLocalStorage.getItem.mockReturnValue('dark');

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(meta.getAttribute('content')).toBe('#0f172a');

    document.head.removeChild(meta);
  });

  test('updates meta theme-color for light theme', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', '#0f172a');
    document.head.appendChild(meta);

    mockLocalStorage.getItem.mockReturnValue('light');

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(meta.getAttribute('content')).toBe('#ffffff');

    document.head.removeChild(meta);
  });

  test('setSidebarOpen directly sets sidebar state', () => {
    const SidebarTestComponent: React.FC = () => {
      const { isSidebarOpen, setSidebarOpen } = useUI();
      return (
        <div>
          <div data-testid="sidebar-open">{isSidebarOpen.toString()}</div>
          <button onClick={() => setSidebarOpen(true)}>Open</button>
          <button onClick={() => setSidebarOpen(false)}>Close</button>
        </div>
      );
    };

    render(
      <UIProvider>
        <SidebarTestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');
  });

  test('setTheme directly sets theme', () => {
    const ThemeTestComponent: React.FC = () => {
      const { theme, setTheme } = useUI();
      return (
        <div>
          <div data-testid="theme">{theme}</div>
          <button onClick={() => setTheme('dark')}>Set Dark</button>
          <button onClick={() => setTheme('light')}>Set Light</button>
        </div>
      );
    };

    render(
      <UIProvider>
        <ThemeTestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    fireEvent.click(screen.getByText('Set Light'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  test('system theme change listener updates theme when no saved preference', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const addEventListenerMock = vi.fn();

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    // Find the change handler that was registered
    const changeCall = addEventListenerMock.mock.calls.find(
      (call: unknown[]) => call[0] === 'change'
    );
    expect(changeCall).toBeDefined();

    const changeHandler = changeCall![1];

    // Simulate system theme change to dark
    act(() => {
      changeHandler({ matches: true } as MediaQueryListEvent);
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  test('system theme change overrides saved preference and clears localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('light');

    const addEventListenerMock = vi.fn();

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    const changeCall = addEventListenerMock.mock.calls.find(
      (call: unknown[]) => call[0] === 'change'
    );
    expect(changeCall).toBeDefined();

    const changeHandler = changeCall![1];

    // Simulate system theme change — should follow system and clear saved preference
    act(() => {
      changeHandler({ matches: true } as MediaQueryListEvent);
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme');
  });

  test('system theme change to light mode sets light theme', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const addEventListenerMock = vi.fn();

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // Starts as dark because matchMedia matches dark
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    const changeCall = addEventListenerMock.mock.calls.find(
      (call: unknown[]) => call[0] === 'change'
    );
    expect(changeCall).toBeDefined();

    const changeHandler = changeCall![1];

    // Simulate system theme change to light (matches: false)
    act(() => {
      changeHandler({ matches: false } as MediaQueryListEvent);
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme');
  });

  test('re-enables theme transitions after timeout', () => {
    vi.useFakeTimers();

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // Transition should be disabled initially
    expect(document.documentElement.style.getPropertyValue('--theme-transition')).toBe('none');

    // After 100ms, transition property should be removed
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(document.documentElement.style.getPropertyValue('--theme-transition')).toBe('');

    vi.useRealTimers();
  });

  test('uses addListener fallback when addEventListener is not available', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const addListenerMock = vi.fn();
    const removeListenerMock = vi.fn();

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: addListenerMock,
      removeListener: removeListenerMock,
      // No addEventListener/removeEventListener
      addEventListener: undefined,
      removeEventListener: undefined,
      dispatchEvent: vi.fn(),
    }));

    const { unmount } = render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // Should have used addListener fallback
    expect(addListenerMock).toHaveBeenCalled();

    // Unmount to trigger cleanup with removeListener fallback
    unmount();
    expect(removeListenerMock).toHaveBeenCalled();
  });

  test('returns early when matchMedia is not available', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    // Temporarily remove matchMedia
    const original = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', { value: undefined, writable: true });

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // Should render without error
    expect(screen.getByTestId('theme')).toBeInTheDocument();

    // Restore
    Object.defineProperty(window, 'matchMedia', { value: original, writable: true });
  });
});
