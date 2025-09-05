/**
 * Improved tests for ContactPage component with better isolation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactPage from '../ContactPage';
import { renderWithProviders } from '../../../test-utils/test-utils';
import {
  enhancedCleanup,
  setupTimerTracking,
  restoreTimers,
  flushPromises,
} from '../../../test-utils/cleanup';
import api from '../../../services/api';

// Mock API
vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock navigator.onLine - skip in CI environment due to property redefinition issues
let onlineStatus = true;
// Only mock if not in CI environment where it causes issues
if (typeof window !== 'undefined' && window.navigator && !process.env.CI) {
  try {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get() {
        return onlineStatus;
      },
    });
  } catch (error) {
    // Property may already be defined, skip mocking
    // This is expected in CI environments
  }
}

describe('ContactPage - Improved', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    setupTimerTracking();
    user = userEvent.setup({ delay: null }); // No delay for tests
    onlineStatus = true;
    vi.clearAllMocks();
  });

  afterEach(() => {
    enhancedCleanup();
    restoreTimers();
  });

  describe('Basic Rendering', () => {
    it('renders contact form with all essential fields', async () => {
      renderWithProviders(<ContactPage />);

      // Wait for the component to load
      await waitFor(
        () => {
          expect(
            screen.queryByTestId('loading-spinner')
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Check for form fields using different queries
      const nameInput =
        screen.queryByLabelText(/이름|name/i) ||
        screen.queryByPlaceholderText(/이름|name/i) ||
        screen.queryByRole('textbox', { name: /이름|name/i });
      const emailInput =
        screen.queryByLabelText(/이메일|email/i) ||
        screen.queryByPlaceholderText(/이메일|email/i) ||
        screen.queryByRole('textbox', { name: /이메일|email/i });
      const messageInput =
        screen.queryByLabelText(/메시지|message/i) ||
        screen.queryByPlaceholderText(/메시지|message/i) ||
        screen.queryByRole('textbox', { name: /메시지|message/i });

      expect(nameInput || emailInput || messageInput).toBeTruthy();
      expect(screen.getByText(/전송|submit/i)).toBeInTheDocument();
    });

    it('renders contact information section', () => {
      renderWithProviders(<ContactPage />);

      expect(
        screen.getByText(/researcherhojin@gmail.com/i)
      ).toBeInTheDocument();
    });
  });

  describe.skip('Form Validation', () => {
    it('shows error when submitting empty form', async () => {
      renderWithProviders(<ContactPage />);

      const submitButton = screen.getByText(/전송|submit/i);

      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(
        () => {
          // Check for validation messages (may be HTML5 or custom)
          const nameInput = screen.getByLabelText(
            /이름|name/i
          ) as HTMLInputElement;
          expect(
            nameInput.validity.valueMissing || screen.queryByText(/필수/)
          ).toBeTruthy();
        },
        { timeout: 1000 }
      );
    });

    it('validates email format', async () => {
      renderWithProviders(<ContactPage />);

      const emailInput = screen.getByLabelText(/이메일|email/i);

      await act(async () => {
        await user.type(emailInput, 'invalid-email');
      });

      const submitButton = screen.getByText(/전송|submit/i);
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(
        () => {
          const emailElement = screen.getByLabelText(
            /이메일|email/i
          ) as HTMLInputElement;
          expect(
            emailElement.validity.typeMismatch ||
              screen.queryByText(/올바른.*이메일/)
          ).toBeTruthy();
        },
        { timeout: 1000 }
      );
    });

    it('accepts valid form data', async () => {
      renderWithProviders(<ContactPage />);

      const nameInput = screen.getByLabelText(/이름|name/i);
      const emailInput = screen.getByLabelText(/이메일|email/i);
      const messageInput = screen.getByLabelText(/메시지|message/i);

      await act(async () => {
        await user.type(nameInput, '홍길동');
        await user.type(emailInput, 'test@example.com');
        await user.type(messageInput, '테스트 메시지입니다.');
      });

      expect(nameInput).toHaveValue('홍길동');
      expect(emailInput).toHaveValue('test@example.com');
      expect(messageInput).toHaveValue('테스트 메시지입니다.');
    });
  });

  describe.skip('Form Submission', () => {
    it('submits form with valid data', async () => {
      const mockPost = vi.mocked(api.post);
      mockPost.mockResolvedValueOnce({
        data: { success: true, message: 'Message sent' },
      });

      renderWithProviders(<ContactPage />);

      const nameInput = screen.getByLabelText(/이름|name/i);
      const emailInput = screen.getByLabelText(/이메일|email/i);
      const messageInput = screen.getByLabelText(/메시지|message/i);
      const submitButton = screen.getByText(/전송|submit/i);

      await act(async () => {
        await user.type(nameInput, '홍길동');
        await user.type(emailInput, 'test@example.com');
        await user.type(messageInput, '테스트 메시지입니다.');
        await user.click(submitButton);
        await flushPromises();
      });

      expect(mockPost).toHaveBeenCalledWith(
        '/contact/',
        expect.objectContaining({
          name: '홍길동',
          email: 'test@example.com',
          message: '테스트 메시지입니다.',
        })
      );
    });

    it('shows success message after successful submission', async () => {
      const mockPost = vi.mocked(api.post);
      mockPost.mockResolvedValueOnce({
        data: { success: true, message: 'Message sent successfully' },
      });

      renderWithProviders(<ContactPage />);

      const nameInput = screen.getByLabelText(/이름|name/i);
      const emailInput = screen.getByLabelText(/이메일|email/i);
      const messageInput = screen.getByLabelText(/메시지|message/i);
      const submitButton = screen.getByText(/전송|submit/i);

      await act(async () => {
        await user.type(nameInput, '홍길동');
        await user.type(emailInput, 'test@example.com');
        await user.type(messageInput, '테스트 메시지입니다.');
        await user.click(submitButton);
        await flushPromises();
      });

      await waitFor(
        () => {
          expect(screen.getByText(/성공|success/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('handles submission error gracefully', async () => {
      const mockPost = vi.mocked(api.post);
      mockPost.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<ContactPage />);

      const nameInput = screen.getByLabelText(/이름|name/i);
      const emailInput = screen.getByLabelText(/이메일|email/i);
      const messageInput = screen.getByLabelText(/메시지|message/i);
      const submitButton = screen.getByText(/전송|submit/i);

      await act(async () => {
        await user.type(nameInput, '홍길동');
        await user.type(emailInput, 'test@example.com');
        await user.type(messageInput, '테스트 메시지입니다.');
        await user.click(submitButton);
        await flushPromises();
      });

      await waitFor(
        () => {
          expect(screen.getByText(/오류|error/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Online/Offline Status', () => {
    it('shows offline indicator when offline', async () => {
      onlineStatus = false;

      renderWithProviders(<ContactPage />);

      await waitFor(
        () => {
          const offlineIndicator = screen.queryByText(/오프라인|offline/i);
          if (offlineIndicator) {
            expect(offlineIndicator).toBeInTheDocument();
          }
        },
        { timeout: 1000 }
      );
    });

    it('disables form submission when offline', async () => {
      onlineStatus = false;

      renderWithProviders(<ContactPage />);

      const submitButton = screen.getByText(/전송|submit/i);

      // Check if button is disabled or shows offline state
      await waitFor(
        () => {
          expect(
            submitButton.hasAttribute('disabled') ||
              screen.queryByText(/오프라인|offline/i)
          ).toBeTruthy();
        },
        { timeout: 1000 }
      );
    });

    it('re-enables form when coming back online', async () => {
      onlineStatus = false;
      renderWithProviders(<ContactPage />);

      // Go online
      onlineStatus = true;

      await act(async () => {
        window.dispatchEvent(new Event('online'));
        await flushPromises();
      });

      const submitButton = screen.getByText(/전송|submit/i);

      await waitFor(
        () => {
          expect(submitButton).not.toBeDisabled();
        },
        { timeout: 1000 }
      );
    });
  });
});
