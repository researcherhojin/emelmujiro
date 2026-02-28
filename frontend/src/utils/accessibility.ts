/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

/**
 * Announce message to screen readers
 * Creates a live region that announces messages
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  // Check if document is available (for testing environment)
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  const timeoutId = setTimeout(() => {
    // Check if document still exists before removing
    if (
      typeof document !== 'undefined' &&
      document.body &&
      document.body.contains(announcement)
    ) {
      document.body.removeChild(announcement);
    }
  }, 1000);

  // Return cleanup function for testing
  return () => {
    clearTimeout(timeoutId);
    if (
      typeof document !== 'undefined' &&
      document.body &&
      document.body.contains(announcement)
    ) {
      document.body.removeChild(announcement);
    }
  };
};
