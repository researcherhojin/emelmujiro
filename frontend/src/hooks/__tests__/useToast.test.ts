import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';

describe('useToast', () => {
  it('shows and auto-dismisses toast after duration', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast(1000));

    act(() => {
      result.current.showToast('Hello', 'success');
    });

    expect(result.current.toast).toEqual({ message: 'Hello', type: 'success' });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.toast).toBeNull();
    vi.useRealTimers();
  });

  it('dismissToast clears active timer', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast(5000));

    // Show toast to start the timer
    act(() => {
      result.current.showToast('Test', 'error');
    });

    expect(result.current.toast).not.toBeNull();

    // Dismiss while timer is active (covers line 23 branch)
    act(() => {
      result.current.dismissToast();
    });

    expect(result.current.toast).toBeNull();

    // Advancing timers should not cause re-show since timer was cleared
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toast).toBeNull();
    vi.useRealTimers();
  });

  it('dismissToast works even without an active timer', () => {
    const { result } = renderHook(() => useToast(3000));

    // Dismiss without showing first (timerRef.current is null)
    act(() => {
      result.current.dismissToast();
    });

    expect(result.current.toast).toBeNull();
  });

  it('replaces existing toast and resets timer', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast(3000));

    act(() => {
      result.current.showToast('First', 'success');
    });

    act(() => {
      result.current.showToast('Second', 'error');
    });

    expect(result.current.toast).toEqual({ message: 'Second', type: 'error' });

    // Only 3s needed from last showToast, not 6s
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.toast).toBeNull();
    vi.useRealTimers();
  });
});
