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
import { registerBackgroundSync } from '../../../utils/backgroundSync';
import { InternalAxiosRequestConfig } from 'axios';
import React from 'react';

// Mock dependencies
jest.mock('../../../services/api');
jest.mock('../../../utils/backgroundSync');

const mockedApi = api as jest.Mocked<typeof api>;
const mockedRegisterBackgroundSync =
  registerBackgroundSync as jest.MockedFunction<typeof registerBackgroundSync>;

jest.mock('../../../utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock UnifiedLoading components
jest.mock('../../common/UnifiedLoading', () => ({
  PageLoading: () => <div data-testid="page-loading">Loading...</div>,
  InlineLoading: () => <div data-testid="inline-loading">Loading...</div>,
  ButtonLoading: () => <div data-testid="button-loading">Loading...</div>,
  default: () => <div data-testid="unified-loading">Loading...</div>,
}));

// Mock SEOHelmet to prevent react-helmet-async errors
jest.mock('../../common/SEOHelmet', () => {
  return function MockSEOHelmet() {
    return null;
  };
});

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
jest.mock('framer-motion', () => ({
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

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ContactPage Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
    // Mock window.alert
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const waitForFormToLoad = async () => {
    // Advance timers to skip loading state
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for form to be visible
    await waitFor(() => {
      const nameInput = screen.queryByPlaceholderText('홍길동');
      expect(nameInput).toBeInTheDocument();
    });
  };

  it('renders contact form with all fields', async () => {
    renderWithRouter(<ContactPage />);

    await waitForFormToLoad();

    // Check form fields
    expect(screen.getByPlaceholderText('홍길동')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('example@email.com')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('010-1234-5678')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('회사명 또는 기관명')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('프로젝트에 대해 자세히 설명해주세요...')
    ).toBeInTheDocument();
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      const submitButton = screen.getByText('문의 보내기');
      fireEvent.click(submitButton);

      // Check for validation errors
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '이름을 올바르게 입력해주세요. (최대 50자)'
        );
      });
    });

    it('validates email format', async () => {
      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      const nameInput = screen.getByPlaceholderText('홍길동');
      const emailInput = screen.getByPlaceholderText('example@email.com');
      const messageInput = screen.getByPlaceholderText(
        '프로젝트에 대해 자세히 설명해주세요...'
      );

      // Fill form with invalid email
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });

      const submitButton = screen.getByText('문의 보내기');
      fireEvent.click(submitButton);

      // Check for validation error
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '올바른 이메일 주소를 입력해주세요.'
        );
      });

      // Test with valid email
      jest.clearAllMocks();
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
      const emailInput = screen.getByPlaceholderText('example@email.com');
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      const messageInput = screen.getByPlaceholderText(
        '프로젝트에 대해 자세히 설명해주세요...'
      );

      // Fill form with invalid phone
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
      fireEvent.change(phoneInput, { target: { value: '123' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });

      const submitButton = screen.getByText('문의 보내기');
      fireEvent.click(submitButton);

      // Check for validation error
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '올바른 전화번호를 입력해주세요.'
        );
      });
    });

    it('validates message is not empty', async () => {
      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      const nameInput = screen.getByPlaceholderText('홍길동');
      const emailInput = screen.getByPlaceholderText('example@email.com');
      const messageInput = screen.getByPlaceholderText(
        '프로젝트에 대해 자세히 설명해주세요...'
      );

      // Fill form with empty message
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
      fireEvent.change(messageInput, { target: { value: '' } });

      const submitButton = screen.getByText('문의 보내기');
      fireEvent.click(submitButton);

      // Check for validation error for empty message
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('문의 내용을 입력해주세요.');
      });

      // Test with valid message
      jest.clearAllMocks();
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

  describe('Form Submission', () => {
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
      fireEvent.change(screen.getByPlaceholderText('example@email.com'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('프로젝트에 대해 자세히 설명해주세요...'),
        {
          target: { value: 'This is a test message for the contact form' },
        }
      );

      // Select inquiry type
      // Select inquiry type using select dropdown
      const inquirySelect = screen.getByLabelText('문의 유형 *');
      fireEvent.change(inquirySelect, { target: { value: 'consulting' } });

      // Submit form
      const submitButton = screen.getByText('문의 보내기');
      fireEvent.click(submitButton);

      // Verify API was called
      await waitFor(() => {
        expect(mockedApi.createContact).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '',
          company: '',
          inquiry_type: 'consulting',
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
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Verify navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
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
      fireEvent.change(screen.getByPlaceholderText('example@email.com'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('프로젝트에 대해 자세히 설명해주세요...'),
        {
          target: { value: 'Test message' },
        }
      );

      // Submit form
      const submitButton = screen.getByText('문의 보내기');
      fireEvent.click(submitButton);

      // Verify background sync was registered with correct tag
      await waitFor(() => {
        expect(registerBackgroundSync).toHaveBeenCalledWith(
          'sync-contact-form',
          expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Test message',
          })
        );
      });

      // Verify offline message appears in the UI
      await waitFor(() => {
        expect(
          screen.getByText(/현재 오프라인 상태입니다/)
        ).toBeInTheDocument();
      });
    });

    it('handles API error', async () => {
      mockedApi.createContact.mockRejectedValue(new Error('Network error'));

      // Mock window.location.href setter
      const originalLocation = window.location;
      const hrefSetter = jest.fn();
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          href: '',
          assign: jest.fn(),
          reload: jest.fn(),
          replace: jest.fn(),
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
      fireEvent.change(screen.getByPlaceholderText('example@email.com'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('프로젝트에 대해 자세히 설명해주세요...'),
        {
          target: { value: 'Test message' },
        }
      );

      // Submit form
      const submitButton = screen.getByText('문의 보내기');
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
    it('shows online status indicator', async () => {
      renderWithRouter(<ContactPage />);

      await waitForFormToLoad();

      // Check for online status text
      const onlineText = screen.getByText('온라인');
      expect(onlineText).toBeInTheDocument();
    });

    it('shows offline status indicator', async () => {
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

    it('updates status when connection changes', async () => {
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
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

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
