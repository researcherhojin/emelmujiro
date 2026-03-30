import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { useScrollToSection } from '../useScrollToSection';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createWrapper(initialEntries: string[]) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(MemoryRouter, { initialEntries }, children);
  };
}

describe('useScrollToSection', () => {
  let mockElement: { scrollIntoView: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
    mockElement = { scrollIntoView: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('scrolls to element immediately when already on "/"', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as unknown as HTMLElement);

    const { result } = renderHook(() => useScrollToSection(), {
      wrapper: createWrapper(['/']),
    });

    act(() => {
      result.current('services');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(document.getElementById).toHaveBeenCalledWith('services');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('does nothing if element not found on "/"', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    const { result } = renderHook(() => useScrollToSection(), {
      wrapper: createWrapper(['/']),
    });

    act(() => {
      result.current('nonexistent');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockElement.scrollIntoView).not.toHaveBeenCalled();
  });

  it('navigates to "/" first when on a different page, then scrolls after delay', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as unknown as HTMLElement);

    const { result } = renderHook(() => useScrollToSection(), {
      wrapper: createWrapper(['/profile']),
    });

    act(() => {
      result.current('services');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockElement.scrollIntoView).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(document.getElementById).toHaveBeenCalledWith('services');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('does not scroll if element not found after navigation delay', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    const { result } = renderHook(() => useScrollToSection(), {
      wrapper: createWrapper(['/profile']),
    });

    act(() => {
      result.current('nonexistent');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockElement.scrollIntoView).not.toHaveBeenCalled();
  });

  it('cleans up timer on unmount', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as unknown as HTMLElement);
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { result, unmount } = renderHook(() => useScrollToSection(), {
      wrapper: createWrapper(['/profile']),
    });

    act(() => {
      result.current('services');
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
