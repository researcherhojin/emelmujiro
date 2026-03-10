import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardNavigation } from '../useKeyboardNavigation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Dispatch a KeyboardEvent on window and return whether preventDefault was called */
function fireWindowKeyDown(
  key: string,
  options: {
    code?: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
  } = {}
): boolean {
  let defaultPrevented = false;
  const event = new KeyboardEvent('keydown', {
    key,
    code: options.code ?? key,
    ctrlKey: options.ctrlKey ?? false,
    altKey: options.altKey ?? false,
    shiftKey: options.shiftKey ?? false,
    bubbles: true,
    cancelable: true,
  });
  // Spy on preventDefault for this specific event instance
  const originalPreventDefault = event.preventDefault.bind(event);
  event.preventDefault = () => {
    defaultPrevented = true;
    originalPreventDefault();
  };
  window.dispatchEvent(event);
  return defaultPrevented;
}

describe('useKeyboardNavigation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the handler when a matching key is pressed', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 'a', handler }]));

    fireWindowKeyDown('a');

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('matches by event.key', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 'Enter', handler }]));

    fireWindowKeyDown('Enter');

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('matches by event.code', () => {
    const handler = vi.fn();
    // key property and code property both checked; use code name 'KeyA'
    renderHook(() => useKeyboardNavigation([{ key: 'KeyA', handler }]));

    // Dispatch with code = 'KeyA' but key = 'a' (different)
    const event = new KeyboardEvent('keydown', {
      key: 'a',
      code: 'KeyA',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles ctrlKey modifier — calls handler when Ctrl is held', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 's', ctrlKey: true, handler }]));

    fireWindowKeyDown('s', { ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles altKey modifier — calls handler when Alt is held', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 'h', altKey: true, handler }]));

    fireWindowKeyDown('h', { altKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles shiftKey modifier — calls handler when Shift is held', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 'Tab', shiftKey: true, handler }]));

    fireWindowKeyDown('Tab', { shiftKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does NOT call handler when ctrlKey modifier does not match (requires Ctrl but not held)', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 's', ctrlKey: true, handler }]));

    fireWindowKeyDown('s'); // no Ctrl

    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT call handler when ctrlKey modifier does not match (does not require Ctrl but Ctrl is held)', () => {
    const handler = vi.fn();
    renderHook(
      () => useKeyboardNavigation([{ key: 'a', handler }]) // ctrlKey not specified → must NOT be pressed
    );

    fireWindowKeyDown('a', { ctrlKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT call handler when altKey modifier does not match', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 'h', altKey: true, handler }]));

    fireWindowKeyDown('h'); // no Alt

    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT call handler when shiftKey modifier does not match', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 'Tab', shiftKey: true, handler }]));

    fireWindowKeyDown('Tab'); // no Shift

    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT call handler when the key does not match', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 'a', handler }]));

    fireWindowKeyDown('b');

    expect(handler).not.toHaveBeenCalled();
  });

  it('calls preventDefault on a matched shortcut', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 'Escape', handler }]));

    const prevented = fireWindowKeyDown('Escape');

    expect(prevented).toBe(true);
  });

  it('does NOT call preventDefault when no shortcut matches', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardNavigation([{ key: 'a', handler }]));

    const prevented = fireWindowKeyDown('z');

    expect(prevented).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it('stops after the first match (break) when multiple shortcuts match', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    // Both shortcuts listen for the same key with no modifiers
    renderHook(() =>
      useKeyboardNavigation([
        { key: 'x', handler: handler1 },
        { key: 'x', handler: handler2 },
      ])
    );

    fireWindowKeyDown('x');

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();
  });

  it('cleans up the event listener on unmount', () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardNavigation([{ key: 'q', handler }]));

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    // After unmount the handler must not fire anymore
    fireWindowKeyDown('q');
    expect(handler).not.toHaveBeenCalled();
  });

  it('handles an empty shortcuts array without errors', () => {
    expect(() => {
      const { unmount } = renderHook(() => useKeyboardNavigation([]));
      fireWindowKeyDown('a');
      unmount();
    }).not.toThrow();
  });

  it('handles all three modifiers required simultaneously', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardNavigation([{ key: 'z', ctrlKey: true, altKey: true, shiftKey: true, handler }])
    );

    fireWindowKeyDown('z', { ctrlKey: true, altKey: true, shiftKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
