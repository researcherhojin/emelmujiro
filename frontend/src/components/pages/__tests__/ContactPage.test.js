import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ContactPage from '../ContactPage';
import { registerBackgroundSync } from '../../../utils/backgroundSync';
import * as api from '../../../services/api';

// Mock dependencies
jest.mock('../../../utils/backgroundSync', () => ({
    registerBackgroundSync: jest.fn(),
    SYNC_TAGS: { CONTACT_FORM: 'contact-form' },
}));

jest.mock('../../../services/api', () => ({
    api: {
        createContact: jest.fn(),
    },
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

// Mock SEOHelmet
jest.mock('../../common/SEOHelmet', () => {
    return function SEOHelmet() {
        return null;
    };
});

describe('ContactPage Component', () => {
    const renderWithRouter = (component) => {
        return render(<BrowserRouter>{component}</BrowserRouter>);
    };

    beforeEach(() => {
        jest.clearAllMocks();
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

    it('renders contact form with all fields', () => {
        renderWithRouter(<ContactPage />);
        
        expect(screen.getByPlaceholderText('이름을 입력해주세요')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('이메일을 입력해주세요')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('전화번호를 입력해주세요 (선택)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('회사명을 입력해주세요 (선택)')).toBeInTheDocument();
        expect(screen.getByLabelText('문의 유형')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('문의 내용을 입력해주세요')).toBeInTheDocument();
    });

    describe('Form Validation', () => {
        it('validates required fields', async () => {
            renderWithRouter(<ContactPage />);
            
            const submitButton = screen.getByRole('button', { name: /문의하기/i });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(window.alert).toHaveBeenCalled();
            });
        });

        it('validates email format', async () => {
            renderWithRouter(<ContactPage />);
            
            fireEvent.change(screen.getByPlaceholderText('이름을 입력해주세요'), {
                target: { value: 'John Doe' },
            });
            fireEvent.change(screen.getByPlaceholderText('이메일을 입력해주세요'), {
                target: { value: 'invalid-email' },
            });
            fireEvent.change(screen.getByPlaceholderText('문의 내용을 입력해주세요'), {
                target: { value: 'Test message' },
            });
            
            const submitButton = screen.getByRole('button', { name: /문의하기/i });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(window.alert).toHaveBeenCalledWith('올바른 이메일 주소를 입력해주세요.');
            });
        });

        it('validates phone number format', async () => {
            renderWithRouter(<ContactPage />);
            
            fireEvent.change(screen.getByPlaceholderText('이름을 입력해주세요'), {
                target: { value: 'John Doe' },
            });
            fireEvent.change(screen.getByPlaceholderText('이메일을 입력해주세요'), {
                target: { value: 'john@example.com' },
            });
            fireEvent.change(screen.getByPlaceholderText('전화번호를 입력해주세요 (선택)'), {
                target: { value: '123' },
            });
            fireEvent.change(screen.getByPlaceholderText('문의 내용을 입력해주세요'), {
                target: { value: 'Test message' },
            });
            
            const submitButton = screen.getByRole('button', { name: /문의하기/i });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(window.alert).toHaveBeenCalledWith('올바른 전화번호를 입력해주세요.');
            });
        });

        it('validates message length', async () => {
            renderWithRouter(<ContactPage />);
            
            fireEvent.change(screen.getByPlaceholderText('이름을 입력해주세요'), {
                target: { value: 'John Doe' },
            });
            fireEvent.change(screen.getByPlaceholderText('이메일을 입력해주세요'), {
                target: { value: 'john@example.com' },
            });
            fireEvent.change(screen.getByPlaceholderText('문의 내용을 입력해주세요'), {
                target: { value: 'a'.repeat(1001) },
            });
            
            const submitButton = screen.getByRole('button', { name: /문의하기/i });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(window.alert).toHaveBeenCalledWith('문의 내용을 입력해주세요. (최대 1000자)');
            });
        });
    });

    describe('Form Submission', () => {
        it('submits form successfully when online', async () => {
            api.api.createContact.mockResolvedValue({ data: { success: true } });
            
            renderWithRouter(<ContactPage />);
            
            // Fill form
            fireEvent.change(screen.getByPlaceholderText('이름을 입력해주세요'), {
                target: { value: 'John Doe' },
            });
            fireEvent.change(screen.getByPlaceholderText('이메일을 입력해주세요'), {
                target: { value: 'john@example.com' },
            });
            fireEvent.change(screen.getByPlaceholderText('문의 내용을 입력해주세요'), {
                target: { value: 'Test message' },
            });
            
            const submitButton = screen.getByRole('button', { name: /문의하기/i });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(api.api.createContact).toHaveBeenCalledWith({
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '',
                    company: '',
                    inquiry_type: 'solution',
                    message: 'Test message',
                });
                expect(window.alert).toHaveBeenCalledWith('문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
            });
        });

        it('handles offline submission with background sync', async () => {
            Object.defineProperty(navigator, 'onLine', { value: false });
            registerBackgroundSync.mockResolvedValue(true);
            
            renderWithRouter(<ContactPage />);
            
            // Fill form
            fireEvent.change(screen.getByPlaceholderText('이름을 입력해주세요'), {
                target: { value: 'John Doe' },
            });
            fireEvent.change(screen.getByPlaceholderText('이메일을 입력해주세요'), {
                target: { value: 'john@example.com' },
            });
            fireEvent.change(screen.getByPlaceholderText('문의 내용을 입력해주세요'), {
                target: { value: 'Test message' },
            });
            
            const submitButton = screen.getByRole('button', { name: /문의하기/i });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(registerBackgroundSync).toHaveBeenCalled();
                expect(screen.getByText(/인터넷 연결이 복구되면 자동으로 전송됩니다/)).toBeInTheDocument();
            });
        });

        it('handles API error', async () => {
            api.api.createContact.mockRejectedValue(new Error('Network error'));
            
            renderWithRouter(<ContactPage />);
            
            // Fill form
            fireEvent.change(screen.getByPlaceholderText('이름을 입력해주세요'), {
                target: { value: 'John Doe' },
            });
            fireEvent.change(screen.getByPlaceholderText('이메일을 입력해주세요'), {
                target: { value: 'john@example.com' },
            });
            fireEvent.change(screen.getByPlaceholderText('문의 내용을 입력해주세요'), {
                target: { value: 'Test message' },
            });
            
            const submitButton = screen.getByRole('button', { name: /문의하기/i });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(window.alert).toHaveBeenCalledWith('문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            });
        });
    });

    describe('Online/Offline Status', () => {
        it('shows online status indicator', () => {
            renderWithRouter(<ContactPage />);
            
            const onlineIndicator = screen.getByText(/온라인/);
            expect(onlineIndicator).toBeInTheDocument();
            expect(onlineIndicator).toHaveClass('bg-green-500');
        });

        it('shows offline status indicator', () => {
            Object.defineProperty(navigator, 'onLine', { value: false });
            renderWithRouter(<ContactPage />);
            
            const offlineIndicator = screen.getByText(/오프라인/);
            expect(offlineIndicator).toBeInTheDocument();
            expect(offlineIndicator).toHaveClass('bg-orange-500');
        });

        it('updates status when connection changes', async () => {
            renderWithRouter(<ContactPage />);
            
            // Initially online
            expect(screen.getByText(/온라인/)).toBeInTheDocument();
            
            // Go offline
            Object.defineProperty(navigator, 'onLine', { value: false });
            fireEvent(window, new Event('offline'));
            
            await waitFor(() => {
                expect(screen.getByText(/오프라인/)).toBeInTheDocument();
            });
            
            // Go back online
            Object.defineProperty(navigator, 'onLine', { value: true });
            fireEvent(window, new Event('online'));
            
            await waitFor(() => {
                expect(screen.getByText(/온라인/)).toBeInTheDocument();
            });
        });
    });

    describe('Character Counter', () => {
        it('shows character count for message field', () => {
            renderWithRouter(<ContactPage />);
            
            const messageField = screen.getByPlaceholderText('문의 내용을 입력해주세요');
            
            fireEvent.change(messageField, { target: { value: 'Hello' } });
            
            expect(screen.getByText('5/1000')).toBeInTheDocument();
        });

        it('updates character count as user types', () => {
            renderWithRouter(<ContactPage />);
            
            const messageField = screen.getByPlaceholderText('문의 내용을 입력해주세요');
            
            fireEvent.change(messageField, { target: { value: 'Test message' } });
            expect(screen.getByText('12/1000')).toBeInTheDocument();
            
            fireEvent.change(messageField, { target: { value: 'Updated test message' } });
            expect(screen.getByText('20/1000')).toBeInTheDocument();
        });
    });

    describe('Page Behavior', () => {
        it('scrolls to top on mount', () => {
            renderWithRouter(<ContactPage />);
            
            expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        });

        it('cleans up event listeners on unmount', () => {
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
            
            const { unmount } = renderWithRouter(<ContactPage />);
            unmount();
            
            expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
        });
    });
});