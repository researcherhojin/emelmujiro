import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  handler: () => void;
  description?: string;
}

/**
 * Custom hook for keyboard navigation
 * Provides keyboard shortcuts for better accessibility
 */
export const useKeyboardNavigation = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matchesKey =
          event.key === shortcut.key || event.code === shortcut.key;
        const matchesCtrl = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const matchesAlt = shortcut.altKey ? event.altKey : !event.altKey;
        const matchesShift = shortcut.shiftKey
          ? event.shiftKey
          : !event.shiftKey;

        if (matchesKey && matchesCtrl && matchesAlt && matchesShift) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
