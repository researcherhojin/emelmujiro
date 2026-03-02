import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import {
  useKeyboardNavigation,
  commonShortcuts,
  useFocusTrap,
} from '../useKeyboardNavigation';

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

/** Create a container div with a set of focusable children appended to document.body */
function createFocusableContainer(count = 3): {
  container: HTMLDivElement;
  buttons: HTMLButtonElement[];
} {
  const container = document.createElement('div');
  const buttons: HTMLButtonElement[] = [];
  for (let i = 0; i < count; i++) {
    const btn = document.createElement('button');
    btn.textContent = `Button ${i + 1}`;
    container.appendChild(btn);
    buttons.push(btn);
  }
  document.body.appendChild(container);
  return { container, buttons };
}

// ---------------------------------------------------------------------------
// useKeyboardNavigation
// ---------------------------------------------------------------------------

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
    renderHook(() =>
      useKeyboardNavigation([{ key: 's', ctrlKey: true, handler }])
    );

    fireWindowKeyDown('s', { ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles altKey modifier — calls handler when Alt is held', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardNavigation([{ key: 'h', altKey: true, handler }])
    );

    fireWindowKeyDown('h', { altKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles shiftKey modifier — calls handler when Shift is held', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardNavigation([{ key: 'Tab', shiftKey: true, handler }])
    );

    fireWindowKeyDown('Tab', { shiftKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does NOT call handler when ctrlKey modifier does not match (requires Ctrl but not held)', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardNavigation([{ key: 's', ctrlKey: true, handler }])
    );

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
    renderHook(() =>
      useKeyboardNavigation([{ key: 'h', altKey: true, handler }])
    );

    fireWindowKeyDown('h'); // no Alt

    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT call handler when shiftKey modifier does not match', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardNavigation([{ key: 'Tab', shiftKey: true, handler }])
    );

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

    const { unmount } = renderHook(() =>
      useKeyboardNavigation([{ key: 'q', handler }])
    );

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
      useKeyboardNavigation([
        { key: 'z', ctrlKey: true, altKey: true, shiftKey: true, handler },
      ])
    );

    fireWindowKeyDown('z', { ctrlKey: true, altKey: true, shiftKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// commonShortcuts
// ---------------------------------------------------------------------------

describe('commonShortcuts', () => {
  it('exposes all expected shortcut keys', () => {
    expect(commonShortcuts).toHaveProperty('search');
    expect(commonShortcuts).toHaveProperty('home');
    expect(commonShortcuts).toHaveProperty('blog');
    expect(commonShortcuts).toHaveProperty('contact');
    expect(commonShortcuts).toHaveProperty('escape');
  });

  it('search shortcut has key "/" and no modifier flags', () => {
    expect(commonShortcuts.search.key).toBe('/');
    expect(
      (commonShortcuts.search as Record<string, unknown>).ctrlKey
    ).toBeUndefined();
    expect(
      (commonShortcuts.search as Record<string, unknown>).altKey
    ).toBeUndefined();
    expect(
      (commonShortcuts.search as Record<string, unknown>).shiftKey
    ).toBeUndefined();
  });

  it('home shortcut has key "h" and altKey true', () => {
    expect(commonShortcuts.home.key).toBe('h');
    expect(commonShortcuts.home.altKey).toBe(true);
  });

  it('blog shortcut has key "b" and altKey true', () => {
    expect(commonShortcuts.blog.key).toBe('b');
    expect(commonShortcuts.blog.altKey).toBe(true);
  });

  it('contact shortcut has key "c" and altKey true', () => {
    expect(commonShortcuts.contact.key).toBe('c');
    expect(commonShortcuts.contact.altKey).toBe(true);
  });

  it('escape shortcut has key "Escape" and no modifier flags', () => {
    expect(commonShortcuts.escape.key).toBe('Escape');
    expect(
      (commonShortcuts.escape as Record<string, unknown>).ctrlKey
    ).toBeUndefined();
    expect(
      (commonShortcuts.escape as Record<string, unknown>).altKey
    ).toBeUndefined();
    expect(
      (commonShortcuts.escape as Record<string, unknown>).shiftKey
    ).toBeUndefined();
  });

  it('each shortcut has a description string', () => {
    for (const [, value] of Object.entries(commonShortcuts)) {
      expect(typeof value.description).toBe('string');
      expect(value.description!.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// useFocusTrap
// ---------------------------------------------------------------------------

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let buttons: HTMLButtonElement[];

  beforeEach(() => {
    ({ container, buttons } = createFocusableContainer(3));
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('focuses the first focusable element when activated', () => {
    const focusSpy = vi.spyOn(buttons[0], 'focus');

    renderHook(() => {
      const ref = useRef(container);
      useFocusTrap(ref, true);
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('does nothing when isActive is false', () => {
    const focusSpy = vi.spyOn(buttons[0], 'focus');

    renderHook(() => {
      const ref = useRef(container);
      useFocusTrap(ref, false);
    });

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('wraps focus from the last element to the first on Tab', () => {
    renderHook(() => {
      const ref = useRef(container);
      useFocusTrap(ref, true);
    });

    // Simulate focus being on the last button
    buttons[2].focus();

    const focusSpy = vi.spyOn(buttons[0], 'focus');

    // Tab from last element — should wrap to first
    fireEvent.keyDown(container, { key: 'Tab', shiftKey: false });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('does NOT wrap focus when Tab is pressed on a non-last element', () => {
    renderHook(() => {
      const ref = useRef(container);
      useFocusTrap(ref, true);
    });

    // Focus the first (non-last) button
    buttons[0].focus();

    const wrapSpy = vi.spyOn(buttons[2], 'focus');

    fireEvent.keyDown(container, { key: 'Tab', shiftKey: false });

    expect(wrapSpy).not.toHaveBeenCalled();
  });

  it('wraps focus from the first element to the last on Shift+Tab', () => {
    renderHook(() => {
      const ref = useRef(container);
      useFocusTrap(ref, true);
    });

    // Simulate focus being on the first button
    buttons[0].focus();

    const focusSpy = vi.spyOn(buttons[2], 'focus');

    // Shift+Tab from first element — should wrap to last
    fireEvent.keyDown(container, { key: 'Tab', shiftKey: true });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('does NOT wrap focus when Shift+Tab is pressed on a non-first element', () => {
    renderHook(() => {
      const ref = useRef(container);
      useFocusTrap(ref, true);
    });

    // Focus the last (non-first) button
    buttons[2].focus();

    const wrapSpy = vi.spyOn(buttons[0], 'focus');

    fireEvent.keyDown(container, { key: 'Tab', shiftKey: true });

    expect(wrapSpy).not.toHaveBeenCalled();
  });

  it('dispatches a "close" CustomEvent on the container when Escape is pressed', () => {
    renderHook(() => {
      const ref = useRef(container);
      useFocusTrap(ref, true);
    });

    const closeHandler = vi.fn();
    container.addEventListener('close', closeHandler);

    fireEvent.keyDown(container, { key: 'Escape' });

    expect(closeHandler).toHaveBeenCalledTimes(1);

    container.removeEventListener('close', closeHandler);
  });

  it('does NOT dispatch "close" event for non-Escape keys', () => {
    renderHook(() => {
      const ref = useRef(container);
      useFocusTrap(ref, true);
    });

    const closeHandler = vi.fn();
    container.addEventListener('close', closeHandler);

    fireEvent.keyDown(container, { key: 'Enter' });

    expect(closeHandler).not.toHaveBeenCalled();

    container.removeEventListener('close', closeHandler);
  });

  it('cleans up keydown listeners when isActive toggles to false', () => {
    const removeListenerSpy = vi.spyOn(container, 'removeEventListener');

    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => {
        const ref = useRef(container);
        useFocusTrap(ref, active);
      },
      { initialProps: { active: true } }
    );

    // Toggle off — cleanup should run
    rerender({ active: false });

    expect(removeListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('does nothing when containerRef.current is null', () => {
    expect(() => {
      renderHook(() => {
        // Pass a ref whose current is null
        const ref = useRef<HTMLElement>(null);
        useFocusTrap(ref, true);
      });
    }).not.toThrow();
  });

  it('handles a container with no focusable elements without throwing', () => {
    const emptyContainer = document.createElement('div');
    document.body.appendChild(emptyContainer);

    try {
      expect(() => {
        renderHook(() => {
          const ref = useRef(emptyContainer);
          useFocusTrap(ref, true);
        });
      }).not.toThrow();
    } finally {
      document.body.removeChild(emptyContainer);
    }
  });

  it('handles Tab key when container has exactly one focusable element', () => {
    const singleContainer = document.createElement('div');
    const btn = document.createElement('button');
    btn.textContent = 'Solo';
    singleContainer.appendChild(btn);
    document.body.appendChild(singleContainer);

    try {
      renderHook(() => {
        const ref = useRef(singleContainer);
        useFocusTrap(ref, true);
      });

      btn.focus();
      const focusSpy = vi.spyOn(btn, 'focus');

      // Tab on last-and-only element wraps to first (same element)
      fireEvent.keyDown(singleContainer, { key: 'Tab', shiftKey: false });

      expect(focusSpy).toHaveBeenCalled();
    } finally {
      document.body.removeChild(singleContainer);
    }
  });
});
