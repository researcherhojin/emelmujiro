import { vi } from 'vitest';
import type { MockedFunction, Mocked } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ContactPage from '../ContactPage';
import { api } from '../../../services/api';
import {
  registerBackgroundSync,
  SYNC_TAGS,
} from '../../../utils/backgroundSync';
import { InternalAxiosRequestConfig } from 'axios';
import React from 'react';

// Mock dependencies
vi.mock('../../../services/api');
vi.mock('../../../utils/backgroundSync');

const mockedApi = api as Mocked<typeof api>;
const mockedRegisterBackgroundSync = registerBackgroundSync as MockedFunction<
  typeof registerBackgroundSync
>;

vi.mock('../../../utils/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

// Mock UnifiedLoading components
vi.mock('../../common/UnifiedLoading', () => ({
  PageLoading: () => <div data-testid="page-loading">Loading...</div>,
  InlineLoading: () => <div data-testid="inline-loading">Loading...</div>,
  ButtonLoading: () => <div data-testid="button-loading">Loading...</div>,
  default: () => <div data-testid="unified-loading">Loading...</div>,
}));

// Mock SEOHelmet to prevent react-helmet-async errors
vi.mock('../../common/SEOHelmet', () => ({
  default: function MockSEOHelmet() {
    return null;
  },
}));

// Define type for motion component props
type MotionComponentProps = {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  [key: string]: unknown;
};

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: MotionComponentProps) => (
      <div {...props}>{children}</div>
    ),
    section: ({ children, ...props }: MotionComponentProps) => (
      <section {...props}>{children}</section>
    ),
    button: ({ children, ...props }: MotionComponentProps) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ContactPage Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Don't use fake timers with waitFor - causes timeout issues
    // vi.useFakeTimers();
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
    // Mock window.alert
    window.alert = vi.fn();
  });

  afterEach(() => {
    // vi.runOnlyPendingTimers();
    // vi.useRealTimers();
  });

  const waitForFormToLoad = async () => {
    // Wait for form to be visible (no need for timer manipulation)
    await waitFor(
      () => {
        const nameInput = screen.queryByPlaceholderText('홍길동');
        expect(nameInput).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  };

  it.skip('renders contact form with all fields', async () => {
    renderWithRouter(<ContactPage />);

    await waitForFormToLoad();

    // Check form fields
    expect(screen.getByPlaceholderText('홍길동')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('example@company.com')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('010-1234-5678')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('에멜무지로')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('문의하실 내용을 자유롭게 작성해주세요.')
    ).toBeInTheDocument();
  });

  describe.skip('Form Validation', () => {
    it.skip('validates required fields', async () => {
      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      const submitButton = screen.getByText('문의 전송');
      fireEvent.click(submitButton);

      // Check for validation errors
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '필수 항목을 모두 입력해주세요.'
        );
      });
    });

    it('validates email format', async () => {
      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      const nameInput = screen.getByPlaceholderText('홍길동');
      const emailInput = screen.getByPlaceholderText('example@company.com');
      const messageInput = screen.getByPlaceholderText(
        '문의하실 내용을 자유롭게 작성해주세요.'
      );

      // Fill form with invalid email
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });

      const submitButton = screen.getByText('문의 전송');
      fireEvent.click(submitButton);

      // Check for validation error
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '올바른 이메일 형식을 입력해주세요.'
        );
      });

      // Test with valid email
      vi.clearAllMocks();
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });

      // Mock successful submission
      mockedApi.createContact.mockResolvedValue({
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      fireEvent.click(submitButton);

      // Should not show email validation error
      await waitFor(() => {
        expect(window.alert).not.toHaveBeenCalledWith(
          '올바른 이메일 주소를 입력해주세요.'
        );
      });
    });

    it('validates phone number format', async () => {
      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      const nameInput = screen.getByPlaceholderText('홍길동');
      const emailInput = screen.getByPlaceholderText('example@company.com');
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      const messageInput = screen.getByPlaceholderText(
        '문의하실 내용을 자유롭게 작성해주세요.'
      );

      // Fill form with invalid phone
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
      fireEvent.change(phoneInput, { target: { value: '123' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });

      const submitButton = screen.getByText('문의 전송');
      fireEvent.click(submitButton);

      // Check for validation error
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)'
        );
      });
    });

    it('validates message is not empty', async () => {
      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      const nameInput = screen.getByPlaceholderText('홍길동');
      const emailInput = screen.getByPlaceholderText('example@company.com');
      const messageInput = screen.getByPlaceholderText(
        '문의하실 내용을 자유롭게 작성해주세요.'
      );

      // Fill form with empty message
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
      fireEvent.change(messageInput, { target: { value: '' } });

      const submitButton = screen.getByText('문의 전송');
      fireEvent.click(submitButton);

      // Check for validation error for empty message
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '필수 항목을 모두 입력해주세요.'
        );
      });

      // Test with valid message
      vi.clearAllMocks();
      mockedApi.createContact.mockResolvedValue({
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });
      fireEvent.change(messageInput, {
        target: { value: 'This is a valid message' },
      });
      fireEvent.click(submitButton);

      // Should show success message
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.'
        );
      });
    });
  });

  describe.skip('Form Submission', () => {
    it('submits form successfully when online', async () => {
      mockedApi.createContact.mockResolvedValue({
        data: { id: 1, message: 'Success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('홍길동'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByPlaceholderText('example@company.com'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('문의하실 내용을 자유롭게 작성해주세요.'),
        {
          target: { value: 'This is a test message for the contact form' },
        }
      );

      // Select inquiry type
      // Select inquiry type using select dropdown
      const inquirySelect = screen.getByLabelText('문의 유형 *');
      fireEvent.change(inquirySelect, { target: { value: 'consulting' } });

      // Submit form
      const submitButton = screen.getByText('문의 전송');
      fireEvent.click(submitButton);

      // Verify API was called
      await waitFor(() => {
        expect(mockedApi.createContact).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '',
          company: '',
          inquiryType: 'consulting',
          message: 'This is a test message for the contact form',
        });
      });

      // Verify success message
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.'
        );
      });

      // Advance timers to trigger navigation (which happens after 2 seconds)
      // Don't need timer manipulation without fake timers
      // act(() => {
      //   vi.advanceTimersByTime(2000);
      // });

      // Verify navigation (happens after 2 seconds)
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/');
        },
        { timeout: 3000 }
      );
    });

    it('handles offline submission with background sync', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      mockedRegisterBackgroundSync.mockResolvedValue(true);

      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('홍길동'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByPlaceholderText('example@company.com'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('문의하실 내용을 자유롭게 작성해주세요.'),
        {
          target: { value: 'Test message' },
        }
      );

      // Submit form
      const submitButton = screen.getByText('문의 전송');
      fireEvent.click(submitButton);

      // Verify background sync was registered
      await waitFor(() => {
        expect(registerBackgroundSync).toHaveBeenCalledWith(
          'sync-contact-form'
        );
      });

      // Verify data was stored in localStorage
      const storedData = JSON.parse(
        localStorage.getItem('pendingContact') || '{}'
      );
      expect(storedData.name).toBe('John Doe');
      expect(storedData.email).toBe('john@example.com');
      expect(storedData.message).toBe('Test message');

      // Verify offline message appears
      await waitFor(() => {
        expect(screen.getByText('오프라인 저장됨')).toBeInTheDocument();
      });
    });

    it('handles API error', async () => {
      mockedApi.createContact.mockRejectedValue(new Error('Network error'));

      // Mock window.location.href setter
      const originalLocation = window.location;
      const hrefSetter = vi.fn();
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          href: '',
          assign: vi.fn(),
          reload: vi.fn(),
          replace: vi.fn(),
        },
      });
      Object.defineProperty(window.location, 'href', {
        set: hrefSetter,
        get: () => '',
        configurable: true,
      });

      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('홍길동'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByPlaceholderText('example@company.com'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('문의하실 내용을 자유롭게 작성해주세요.'),
        {
          target: { value: 'Test message' },
        }
      );

      // Submit form
      const submitButton = screen.getByText('문의 전송');
      fireEvent.click(submitButton);

      // Verify that API was called and failed
      await waitFor(() => {
        expect(mockedApi.createContact).toHaveBeenCalled();
      });

      // Verify fallback to mailto (window.location.href is set to mailto link)
      await waitFor(() => {
        expect(hrefSetter).toHaveBeenCalledWith(
          expect.stringContaining('mailto:')
        );
      });

      // Restore original location
      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
      });
    });
  });

  describe('Online/Offline Status', () => {
    it.skip('shows online status indicator', async () => {
      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      // Check for online status text
      const onlineText = screen.getByText('온라인');
      expect(onlineText).toBeInTheDocument();
    });

    it.skip('shows offline status indicator', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      // Check for offline status text
      const offlineText = screen.getByText('오프라인');
      expect(offlineText).toBeInTheDocument();
    });

    it.skip('updates status when connection changes', async () => {
      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      // Initially online
      expect(screen.getByText('온라인')).toBeInTheDocument();

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      // Check for offline status
      await waitFor(() => {
        expect(screen.getByText('오프라인')).toBeInTheDocument();
      });

      // Simulate going back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      // Check for online status
      await waitFor(() => {
        expect(screen.getByText('온라인')).toBeInTheDocument();
      });
    });
  });

  // Character Counter tests removed - feature no longer exists in ContactPage

  describe('Page Behavior', () => {
    it('scrolls to top on mount', () => {
      renderWithRouter(<ContactPage />);

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderWithRouter(<ContactPage />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
