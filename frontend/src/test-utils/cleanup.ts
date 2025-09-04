import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * Enhanced cleanup utilities for better test isolation
 */

// Store original timers
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;
const originalRequestAnimationFrame = global.requestAnimationFrame;

// Track active timers
const activeTimers = new Set<number>();
const activeIntervals = new Set<number>();
const activeAnimationFrames = new Set<number>();

// Enhanced cleanup function
export const enhancedCleanup = () => {
  // Clear all active timers
  activeTimers.forEach((timer) => clearTimeout(timer));
  activeTimers.clear();

  // Clear all active intervals
  activeIntervals.forEach((interval) => clearInterval(interval));
  activeIntervals.clear();

  // Clear all animation frames
  activeAnimationFrames.forEach((frame) => cancelAnimationFrame(frame));
  activeAnimationFrames.clear();

  // Standard React Testing Library cleanup
  cleanup();

  // Clear any lingering DOM elements with specific test attributes
  document.querySelectorAll('[data-testid]').forEach((el) => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  // Clear any modals or overlays
  document
    .querySelectorAll('[role="dialog"], [role="alertdialog"], .modal, .overlay')
    .forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

  // Clear any tooltips or popovers
  document
    .querySelectorAll('[role="tooltip"], .tooltip, .popover')
    .forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

  // Reset document body
  document.body.innerHTML = '';

  // Clear all event listeners (simplified approach)
  const newBody = document.body.cloneNode(true) as HTMLBodyElement;
  document.body.parentNode?.replaceChild(newBody, document.body);
};

// Wrap timer functions to track them
export const setupTimerTracking = () => {
  global.setTimeout = ((
    callback: Function,
    delay?: number,
    ...args: unknown[]
  ) => {
    const timerId = originalSetTimeout(callback, delay, ...args);
    activeTimers.add(timerId as unknown as number);
    return timerId;
  }) as typeof setTimeout;

  global.setInterval = ((
    callback: Function,
    delay?: number,
    ...args: unknown[]
  ) => {
    const intervalId = originalSetInterval(callback, delay, ...args);
    activeIntervals.add(intervalId as unknown as number);
    return intervalId;
  }) as typeof setInterval;

  if (global.requestAnimationFrame) {
    global.requestAnimationFrame = ((callback: (time: number) => void) => {
      const frameId = originalRequestAnimationFrame(callback);
      activeAnimationFrames.add(frameId);
      return frameId;
    }) as typeof requestAnimationFrame;
  }
};

// Restore original timer functions
export const restoreTimers = () => {
  global.setTimeout = originalSetTimeout;
  global.setInterval = originalSetInterval;
  global.requestAnimationFrame = originalRequestAnimationFrame;
};

// Auto cleanup after each test
export const setupAutoCleanup = () => {
  afterEach(() => {
    enhancedCleanup();
  });
};

// Wait for all pending promises
export const flushPromises = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

// Wait for next tick
export const nextTick = () => {
  return new Promise((resolve) => {
    process.nextTick ? process.nextTick(resolve) : setTimeout(resolve, 0);
  });
};

// Wait for all pending operations
export const waitForPendingOperations = async () => {
  await flushPromises();
  await nextTick();
};
