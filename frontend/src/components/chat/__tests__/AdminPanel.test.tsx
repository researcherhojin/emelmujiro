import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AdminPanel from '../AdminPanel';
import { ChatProvider } from '../../../contexts/ChatContext';
import { UIProvider } from '../../../contexts/UIContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      ...props
    }: React.PropsWithChildren<
      React.ButtonHTMLAttributes<HTMLButtonElement>
    >) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock react-i18next with proper translations
const translations: Record<string, string> = {
  'chat.admin.title': '채팅 관리자 패널',
  'chat.admin.settings': '설정',
  'chat.admin.cannedResponses': '자동 응답',
  'chat.admin.statistics': '통계',
  'chat.admin.users': '사용자',
  'chat.admin.connected': '연결됨',
  'chat.admin.welcomeMessage': '환영 메시지',
  'chat.admin.maxMessageLength': '최대 메시지 길이',
  'chat.admin.features': '기능 설정',
  'chat.admin.allowFileUpload': '파일 업로드 허용',
  'chat.admin.allowEmoji': '이모지 사용 허용',
  'chat.admin.soundEnabled': '알림음 활성화',
  'chat.admin.saveSettings': '설정 저장',
  'chat.admin.add': '추가',
  'chat.admin.addCannedResponse': '새 자동 응답 추가',
  'chat.admin.totalMessages': '총 메시지',
  'chat.admin.userMessages': '사용자 메시지',
  'chat.admin.avgResponseTime': '평균 응답시간',
  'chat.admin.satisfaction': '만족도',
  'chat.admin.businessHours': '운영 현황',
  'chat.admin.currentlyOpen': '현재 운영 중',
  'chat.admin.currentlyClosed': '현재 운영 종료',
  'chat.admin.activeUsers': '활성 사용자',
  'chat.admin.online': '온라인',
  'chat.admin.anonymousUser': '익명 사용자',
  'chat.admin.connectionId': '연결 ID',
  'chat.admin.noActiveUsers': '활성 사용자가 없습니다',
  'chat.admin.refresh': '새로고침',
  'chat.admin.settingsSaved': '설정이 저장되었습니다.',
  'chat.admin.settingsSaveFailed': '설정 저장에 실패했습니다.',
  'common.edit': '수정',
  'common.delete': '삭제',
  'common.cancel': '취소',
  'common.save': '저장',
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) =>
      translations[key] || defaultValue || key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ko',
    },
  }),
}));

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <UIProvider>
      <ChatProvider>{component}</ChatProvider>
    </UIProvider>
  );
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    store,
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-' + Math.random()),
  },
});

describe('AdminPanel', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('renders when open', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('채팅 관리자 패널')).toBeInTheDocument();
      expect(screen.getByText('설정')).toBeInTheDocument();
      expect(screen.getByText('자동 응답')).toBeInTheDocument();
      expect(screen.getByText('통계')).toBeInTheDocument();
      expect(screen.getByText('사용자')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      const { container } = renderWithProviders(
        <AdminPanel isOpen={false} onClose={mockOnClose} />
      );

      const panel = container.querySelector('[role="dialog"]');
      expect(panel).toBeNull();
    });

    it('renders all navigation tabs', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      // Tabs are rendered as buttons with text
      expect(screen.getByText('설정')).toBeInTheDocument();
      expect(screen.getByText('자동 응답')).toBeInTheDocument();
      expect(screen.getByText('통계')).toBeInTheDocument();
      expect(screen.getByText('사용자')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('displays settings tab by default', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      // Check if settings tab is selected (has blue-600 class)
      const settingsButton = screen.getByText('설정').closest('button');
      expect(settingsButton).toHaveClass('text-blue-600');
      expect(screen.getByText('환영 메시지')).toBeInTheDocument();
    });

    it('switches to canned responses tab', async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      const cannedTab = screen.getByText('자동 응답').closest('button')!;
      fireEvent.click(cannedTab);

      await waitFor(() => {
        expect(cannedTab).toHaveClass('text-blue-600');
        expect(screen.getByText('자동 응답')).toBeInTheDocument();
      });
    });

    it('switches to statistics tab', async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      const statsTab = screen.getByText('통계').closest('button')!;
      fireEvent.click(statsTab);

      await waitFor(() => {
        expect(statsTab).toHaveClass('text-blue-600');
        expect(screen.getByText('통계')).toBeInTheDocument();
      });
    });

    it('switches to users tab', async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      const usersTab = screen.getByText('사용자').closest('button')!;
      fireEvent.click(usersTab);

      await waitFor(() => {
        expect(usersTab).toHaveClass('text-blue-600');
        expect(screen.getByText('활성 사용자')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Tab', () => {
    it('displays all settings fields', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('환영 메시지')).toBeInTheDocument();
      expect(screen.getByText('최대 메시지 길이')).toBeInTheDocument();
      expect(screen.getByText('기능 설정')).toBeInTheDocument();
    });

    it('allows editing welcome message', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      // Find welcome message textarea by its parent label
      const welcomeLabel = screen.getByText('환영 메시지');
      const welcomeInput = welcomeLabel.parentElement?.querySelector(
        'textarea'
      ) as HTMLTextAreaElement;
      await user.clear(welcomeInput);
      await user.type(welcomeInput, '새로운 환영 메시지입니다');

      expect(welcomeInput.value).toBe('새로운 환영 메시지입니다');
    });

    it('allows editing max message length', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      // Find max message length input
      const maxLengthLabel = screen.getByText('최대 메시지 길이');
      const maxLengthInput = maxLengthLabel.parentElement?.querySelector(
        'input'
      ) as HTMLInputElement;
      await user.clear(maxLengthInput);
      await user.type(maxLengthInput, '1000');

      expect(maxLengthInput.value).toBe('1000');
    });

    it('saves settings to localStorage', async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      const saveButton = screen.getByRole('button', {
        name: /chat.admin.saveSettings/i,
      });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const savedSettings = localStorage.getItem('chat-admin-settings');
        expect(savedSettings).not.toBeNull();
      });
    });

    it('shows success notification on save', async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      const saveButton = screen.getByRole('button', {
        name: /chat.admin.saveSettings/i,
      });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('설정이 저장되었습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('Canned Responses Tab', () => {
    beforeEach(async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);
      const cannedTab = screen.getByText('자동 응답').closest('button')!;
      fireEvent.click(cannedTab);
      await waitFor(() => {
        expect(screen.getByText('자동 응답')).toBeInTheDocument();
      });
    });

    it('displays existing canned responses', () => {
      expect(screen.getByText(/안녕하세요/)).toBeInTheDocument();
    });

    it('allows adding new canned response', async () => {
      const user = userEvent.setup();

      const input = screen.getByPlaceholderText('새 자동 응답 추가...');
      await user.type(input, '새로운 자동 응답');

      const addButton = screen.getByRole('button', { name: /chat.admin.add/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('새로운 자동 응답')).toBeInTheDocument();
      });
    });

    it('allows editing canned response', async () => {
      const user = userEvent.setup();

      const editButtons = screen.getAllByTitle('수정');
      fireEvent.click(editButtons[0]);

      const editInput = screen.getByDisplayValue(/안녕하세요/);
      await user.clear(editInput);
      await user.type(editInput, '수정된 응답');

      const saveButton = screen.getByTitle('저장');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('수정된 응답')).toBeInTheDocument();
      });
    });

    it('allows deleting canned response', async () => {
      const deleteButtons = screen.getAllByTitle('삭제');
      const initialResponseCount = deleteButtons.length;

      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const updatedDeleteButtons = screen.getAllByTitle('삭제');
        expect(updatedDeleteButtons.length).toBe(initialResponseCount - 1);
      });
    });

    it('cancels editing when cancel button is clicked', async () => {
      const user = userEvent.setup();

      const editButtons = screen.getAllByTitle('수정');
      fireEvent.click(editButtons[0]);

      const editInput = screen.getByDisplayValue(/안녕하세요/);
      await user.clear(editInput);
      await user.type(editInput, '수정된 응답');

      const cancelButton = screen.getByTitle('취소');
      fireEvent.click(cancelButton);

      expect(screen.queryByDisplayValue('수정된 응답')).not.toBeInTheDocument();
      expect(screen.getByText(/안녕하세요/)).toBeInTheDocument();
    });

    it('does not add empty canned response', async () => {
      const addButton = screen.getByRole('button', { name: /chat.admin.add/i });
      const initialResponseCount = screen.getAllByTitle('삭제').length;

      fireEvent.click(addButton);

      await waitFor(() => {
        const updatedResponseCount = screen.getAllByTitle('삭제').length;
        expect(updatedResponseCount).toBe(initialResponseCount);
      });
    });
  });

  describe('Statistics Tab', () => {
    beforeEach(async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);
      const statsTab = screen.getByText('통계').closest('button')!;
      fireEvent.click(statsTab);
      await waitFor(() => {
        expect(screen.getByText('통계')).toBeInTheDocument();
      });
    });

    it('displays total messages count', () => {
      expect(screen.getByText('총 메시지')).toBeInTheDocument();
      expect(screen.getByTestId('total-messages-count')).toBeInTheDocument();
    });

    it('displays active users count', () => {
      expect(screen.getByText('활성 사용자')).toBeInTheDocument();
      expect(screen.getByTestId('active-users-count')).toBeInTheDocument();
    });

    it('displays average response time', () => {
      expect(screen.getByText('평균 응답시간')).toBeInTheDocument();
      expect(screen.getByTestId('avg-response-time')).toBeInTheDocument();
    });

    it('displays satisfaction rate', () => {
      expect(screen.getByText('만족도')).toBeInTheDocument();
      expect(screen.getByTestId('satisfaction-rate')).toBeInTheDocument();
    });

    it('has refresh statistics button', () => {
      const refreshButton = screen.getByRole('button', {
        name: /통계 새로고침/i,
      });
      expect(refreshButton).toBeInTheDocument();
    });

    it('refreshes statistics when button clicked', async () => {
      const refreshButton = screen.getByRole('button', {
        name: /통계 새로고침/i,
      });
      fireEvent.click(refreshButton);

      // Check for loading or updated state
      await waitFor(() => {
        expect(screen.getByTestId('total-messages-count')).toBeInTheDocument();
      });
    });
  });

  describe('Users Tab', () => {
    beforeEach(async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);
      const usersTab = screen.getByText('사용자').closest('button')!;
      fireEvent.click(usersTab);
      await waitFor(() => {
        expect(screen.getByText('활성 사용자')).toBeInTheDocument();
      });
    });

    it('displays active users list', () => {
      expect(screen.getByText('활성 사용자')).toBeInTheDocument();
      expect(screen.getByTestId('active-users-list')).toBeInTheDocument();
    });

    it('shows user status indicators', () => {
      const onlineIndicators = screen.getAllByTestId('user-status-online');
      const offlineIndicators = screen.getAllByTestId('user-status-offline');

      expect(
        onlineIndicators.length + offlineIndicators.length
      ).toBeGreaterThan(0);
    });

    it('displays user connection time', () => {
      expect(screen.getByText(/연결 시간:/)).toBeInTheDocument();
    });

    it('displays user last seen time', () => {
      expect(screen.getByText(/마지막 활동:/)).toBeInTheDocument();
    });

    it('allows blocking a user', async () => {
      const blockButtons = screen.getAllByRole('button', { name: /차단/i });
      if (blockButtons.length > 0) {
        fireEvent.click(blockButtons[0]);

        await waitFor(() => {
          expect(
            screen.getByText('사용자가 차단되었습니다.')
          ).toBeInTheDocument();
        });
      }
    });
  });

  describe('Business Hours', () => {
    it('displays business hours in settings', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('기능 설정')).toBeInTheDocument();
      expect(screen.getByText(/월-금/)).toBeInTheDocument();
      expect(screen.getByText(/09:00 - 18:00/)).toBeInTheDocument();
    });

    it('allows toggling business hours', async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      const toggleButton = screen.getByRole('switch', {
        name: /업무 시간 사용/i,
      });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-checked', 'false');
      });
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      // Find the X close button (usually the last button in the header)
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find((btn) => btn.querySelector('svg'));
      fireEvent.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking outside panel', () => {
      const { container } = renderWithProviders(
        <AdminPanel isOpen={true} onClose={mockOnClose} />
      );

      const backdrop = container.querySelector('.backdrop');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('does not close when clicking inside panel', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      const panel = screen.getByRole('dialog');
      fireEvent.click(panel);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes panel on Escape key', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('navigates tabs with arrow keys', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      const settingsTab = screen.getByText('설정').closest('button')!;
      settingsTab.focus();

      fireEvent.keyDown(settingsTab, { key: 'ArrowRight' });

      const cannedTab = screen.getByText('자동 응답').closest('button')!;
      expect(document.activeElement).toBe(cannedTab);
    });
  });

  describe('Error Handling', () => {
    it('shows error notification when save fails', async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      // Wait for component to fully render
      await waitFor(() => {
        expect(screen.getByText('채팅 관리자 패널')).toBeInTheDocument();
      });

      // Override the setItem mock to throw an error only for admin settings
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn((key: string, value: string) => {
        if (key === 'adminSettings') {
          throw new Error('Storage error');
        }
        localStorageMock.store[key] = value;
      });

      const saveButton = screen.getByRole('button', {
        name: /chat.admin.saveSettings/i,
      });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('설정 저장에 실패했습니다.')
        ).toBeInTheDocument();
      });

      // Reset the mock
      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toHaveAttribute(
        'aria-label',
        '관리자 패널'
      );
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(4);
    });

    it('maintains focus trap within panel', () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      const firstTab = screen.getByText('설정').closest('button')!;
      const buttons = screen.getAllByRole('button');
      const lastButton = buttons[buttons.length - 1];

      firstTab.focus();
      expect(document.activeElement).toBe(firstTab);

      // Tab through all focusable elements
      fireEvent.keyDown(document.activeElement!, {
        key: 'Tab',
        shiftKey: true,
      });
      expect(document.activeElement).toBe(lastButton);
    });

    it('announces tab changes to screen readers', async () => {
      renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

      const cannedTab = screen.getByText('자동 응답').closest('button')!;
      fireEvent.click(cannedTab);

      await waitFor(() => {
        expect(cannedTab).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tabpanel')).toHaveAttribute(
          'aria-labelledby',
          cannedTab.id
        );
      });
    });
  });
});
