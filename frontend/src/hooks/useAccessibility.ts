import { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface UseAccessibilityOptions {
  announcePageChanges?: boolean;
  trapFocus?: boolean;
  enableKeyboardShortcuts?: boolean;
  skipLinks?: boolean;
}

export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const { t } = useTranslation();
  const {
    announcePageChanges = true,
    trapFocus: _trapFocus = false,
    enableKeyboardShortcuts = true,
    skipLinks = true,
  } = options;

  const announcementRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // 스크린 리더에 메시지 알림
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!announcementRef.current) {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
        announcementRef.current = announcer;
      }

      announcementRef.current.textContent = message;

      // 메시지를 잠시 후 제거하여 동일한 메시지도 다시 읽을 수 있도록 함
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    },
    []
  );

  // 포커스 트랩 설정
  const setupFocusTrap = useCallback((containerElement: HTMLElement) => {
    const focusableElements = containerElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    containerElement.addEventListener('keydown', handleKeyDown);

    // 이전 포커스 저장
    previousFocusRef.current = document.activeElement as HTMLElement;

    // 첫 번째 요소에 포커스
    firstFocusable?.focus();

    return () => {
      containerElement.removeEventListener('keydown', handleKeyDown);
      // 이전 포커스 복원
      previousFocusRef.current?.focus();
    };
  }, []);

  // 키보드 단축키 설정
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Alt + H: 홈으로 이동
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.location.href = '/';
        announce(t('accessibility.navigatedToHome'));
      }

      // Alt + S: 검색에 포커스
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          '[role="search"] input, input[type="search"]'
        );
        searchInput?.focus();
        announce(t('accessibility.focusedOnSearch'));
      }

      // Alt + M: 메인 콘텐츠로 건너뛰기
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const mainContent = document.querySelector<HTMLElement>(
          'main, [role="main"]'
        );
        mainContent?.focus();
        announce(t('accessibility.skippedToMain'));
      }

      // Escape: 모달/팝업 닫기
      if (e.key === 'Escape') {
        const modal = document.querySelector<HTMLElement>(
          '[role="dialog"], [role="alertdialog"]'
        );
        if (modal) {
          const closeButton = modal.querySelector<HTMLButtonElement>(
            '[aria-label*="close"], [aria-label*="닫기"], button.close'
          );
          closeButton?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () =>
      document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [enableKeyboardShortcuts, announce, t]);

  // 페이지 변경 알림
  useEffect(() => {
    if (!announcePageChanges) return;

    const handleRouteChange = () => {
      const pageTitle = document.title;
      announce(t('accessibility.pageLoaded', { page: pageTitle }), 'polite');
    };

    // 페이지 로드 시 알림
    handleRouteChange();

    // 라우트 변경 감지
    window.addEventListener('popstate', handleRouteChange);

    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [announcePageChanges, announce, t]);

  // Skip Links 생성
  useEffect(() => {
    if (!skipLinks) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className =
      'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black p-2 rounded z-50';
    skipLink.textContent = t('accessibility.skipToContent');

    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.querySelector<HTMLElement>(
        '#main-content, main, [role="main"]'
      );
      mainContent?.focus();
      announce(t('accessibility.skippedToMain'));
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      document.body.removeChild(skipLink);
    };
  }, [skipLinks, announce, t]);

  // 포커스 가시성 개선
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :focus-visible {
        outline: 2px solid #2563eb !important;
        outline-offset: 2px !important;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }

      .focus\\:not-sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return {
    announce,
    setupFocusTrap,
  };
};

// 접근성 관련 유틸리티 함수들
export const a11yUtils = {
  // ARIA 레이블 생성
  generateAriaLabel: (text: string, context?: string) => {
    return context ? `${text}, ${context}` : text;
  },

  // 포커스 가능한 요소인지 확인
  isFocusable: (element: HTMLElement) => {
    if (element.tabIndex < 0) return false;
    if (element.hasAttribute('disabled')) return false;

    const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    return focusableTags.includes(element.tagName) || element.tabIndex >= 0;
  },

  // 색상 대비 확인
  checkColorContrast: (foreground: string, background: string): number => {
    // 간단한 색상 대비 계산 (WCAG 기준)
    const getLuminance = (color: string) => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;

      const [r, g, b] = rgb.map(Number);
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  // 키보드 네비게이션 헬퍼
  handleArrowKeyNavigation: (
    e: React.KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onChange: (index: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    onChange(newIndex);
    items[newIndex]?.focus();
  },
};

export default useAccessibility;
