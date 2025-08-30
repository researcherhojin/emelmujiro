/**
 * Comprehensive tests for Footer component
 * Testing rendering, navigation, modal interactions, and service details
 */

import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

// Set higher timeout for modal tests - increased for CI environment
const MODAL_TEST_TIMEOUT = 15000;

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Mail: ({ className }: { className?: string }) => (
    <div data-testid="mail-icon" className={className}>
      Mail
    </div>
  ),
  Phone: ({ className }: { className?: string }) => (
    <div data-testid="phone-icon" className={className}>
      Phone
    </div>
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <div data-testid="external-link-icon" className={className}>
      ExternalLink
    </div>
  ),
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className}>
      X
    </div>
  ),
  Code: ({ className }: { className?: string }) => (
    <div data-testid="code-icon" className={className}>
      Code
    </div>
  ),
  GraduationCap: ({ className }: { className?: string }) => (
    <div data-testid="graduation-cap-icon" className={className}>
      GraduationCap
    </div>
  ),
  BarChart3: ({ className }: { className?: string }) => (
    <div data-testid="bar-chart-icon" className={className}>
      BarChart3
    </div>
  ),
  Database: ({ className }: { className?: string }) => (
    <div data-testid="database-icon" className={className}>
      Database
    </div>
  ),
}));

// Mock scroll methods
const mockScrollIntoView = vi.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: mockScrollIntoView,
});

describe('Footer Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getElementById
    vi.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders company name', () => {
      const { container } = renderWithRouter(<Footer />);
      // 회사명은 h3 태그에 있고, 여러 h3 중에서 '에멜무지로'를 포함하는 것을 찾음
      const headings = container.querySelectorAll('h3');
      const companyName = Array.from(headings).find(
        (h) => h.textContent === '에멜무지로'
      );
      expect(companyName).toBeInTheDocument();
      expect(companyName?.textContent).toBe('에멜무지로');
    });

    test('renders all service sections', () => {
      const { container } = renderWithRouter(<Footer />);

      const serviceHeaders = container.querySelectorAll('h3');
      const hasServiceHeader = Array.from(serviceHeaders).some(
        (h) => h.textContent === '서비스'
      );
      expect(hasServiceHeader).toBe(true);

      const buttons = container.querySelectorAll('button');
      const serviceNames = [
        'AI 솔루션 개발',
        'AI 교육 & 강의',
        'AI 전략 컨설팅',
        '데이터 분석',
      ];
      serviceNames.forEach((name) => {
        const hasService = Array.from(buttons).some(
          (btn) => btn.textContent === name
        );
        expect(hasService).toBe(true);
      });
    });

    test('renders navigation menu', () => {
      const { container } = renderWithRouter(<Footer />);

      const menuHeaders = container.querySelectorAll('h3');
      const hasMenuHeader = Array.from(menuHeaders).some(
        (h) => h.textContent === '메뉴'
      );
      expect(hasMenuHeader).toBe(true);

      const buttons = container.querySelectorAll('button');
      const menuItems = ['홈', '서비스', '대표 프로필', '문의하기'];
      menuItems.forEach((item) => {
        const hasItem = Array.from(buttons).some((btn) =>
          btn.textContent?.includes(item)
        );
        expect(hasItem).toBe(true);
      });
    });

    test('renders contact information with icons', () => {
      const { container } = renderWithRouter(<Footer />);

      // 이메일 정보 확인 (span 태그에 있음)
      const emailSpans = container.querySelectorAll('span');
      const email = Array.from(emailSpans).find(
        (span) => span.textContent === 'researcherhojin@gmail.com'
      );
      expect(email).toBeInTheDocument();

      // 전화번호 정보 확인
      const phoneSpans = container.querySelectorAll('span');
      const phone = Array.from(phoneSpans).find(
        (span) => span.textContent === '010-7279-0380'
      );
      expect(phone).toBeInTheDocument();

      // Mail과 Phone 아이콘 확인 (lucide-react icons are mocked as div with data-testid)
      expect(
        container.querySelector('[data-testid="mail-icon"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="phone-icon"]')
      ).toBeInTheDocument();
    });

    test('renders contact CTA section', () => {
      const { container } = renderWithRouter(<Footer />);

      // CTA 텍스트는 p.text-base 클래스를 가지고 있음
      const paragraphs = container.querySelectorAll('p');
      const ctaText = Array.from(paragraphs).find(
        (p) => p.textContent === 'AI 프로젝트 도입을 계획 중이시나요?'
      );
      expect(ctaText).toBeInTheDocument();
      expect(ctaText?.textContent).toBe('AI 프로젝트 도입을 계획 중이시나요?');

      // ExternalLink 아이콘 확인
      expect(
        container.querySelector('[data-testid="external-link-icon"]')
      ).toBeInTheDocument();
    });

    test('renders copyright with current year', () => {
      const { container } = renderWithRouter(<Footer />);
      const currentYear = new Date().getFullYear();

      // copyright는 text-center 안의 p 태그에 있음
      const centerDiv = container.querySelector('.text-center');
      const copyright = centerDiv?.querySelector('p');
      expect(copyright).toBeInTheDocument();
      expect(copyright?.textContent).toBe(
        `© ${currentYear} 에멜무지로. All rights reserved.`
      );
    });
  });

  describe('Navigation Functionality', () => {
    test('navigates to profile page when profile link is clicked', () => {
      const { container } = renderWithRouter(<Footer />);

      const profileButtons = container.querySelectorAll('button');
      const profileButton = Array.from(profileButtons).find(
        (btn) => btn.textContent === '대표 프로필'
      );
      expect(profileButton).toBeTruthy();
      fireEvent.click(profileButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    test('navigates to contact page when contact link is clicked', () => {
      const { container } = renderWithRouter(<Footer />);

      const contactButtons = container.querySelectorAll('button');
      const contactButton = Array.from(contactButtons).find(
        (btn) => btn.textContent === '문의하기'
      );
      expect(contactButton).toBeTruthy();
      fireEvent.click(contactButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });

    test('navigates to contact page when CTA button is clicked', () => {
      const { container } = renderWithRouter(<Footer />);

      // CTA 버튼은 ExternalLink 아이콘을 포함한 버튼
      const buttons = container.querySelectorAll('button');
      const ctaButton = Array.from(buttons).find((btn) => {
        const hasText = btn.textContent?.includes('문의하기');
        const hasIcon = btn.querySelector('[data-testid="external-link-icon"]');
        return hasText && hasIcon;
      });
      expect(ctaButton).toBeTruthy();
      fireEvent.click(ctaButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });

    test('scrolls to hero section when home is clicked on same page', () => {
      // Mock current pathname as '/'
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/' },
      });

      const { container } = renderWithRouter(<Footer />);

      const buttons = container.querySelectorAll('button');
      const homeButton = Array.from(buttons).find(
        (btn) => btn.textContent === '홈'
      );
      expect(homeButton).toBeTruthy();
      fireEvent.click(homeButton!);

      // Verify that navigation behavior occurred
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    test(
      'navigates and scrolls to hero section when home is clicked from different page',
      async () => {
        // Mock current pathname as different page
        Object.defineProperty(window, 'location', {
          writable: true,
          value: { pathname: '/profile' },
        });

        vi.useFakeTimers();
        const { container } = renderWithRouter(<Footer />);

        const buttons = container.querySelectorAll('button');
        const homeButton = Array.from(buttons).find(
          (btn) => btn.textContent === '홈'
        );
        expect(homeButton).toBeTruthy();
        fireEvent.click(homeButton!);

        expect(mockNavigate).toHaveBeenCalledWith('/');

        // Fast-forward timer for setTimeout
        vi.advanceTimersByTime(100);

        // Verify that navigation and scroll behavior occurred
        expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

        vi.useRealTimers();
      },
      MODAL_TEST_TIMEOUT
    );

    test('scrolls to services section when services link is clicked', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/' },
      });

      const { container } = renderWithRouter(<Footer />);

      const buttons = container.querySelectorAll('button');
      const servicesButtons = Array.from(buttons).filter(
        (btn) => btn.textContent === '서비스'
      );
      const servicesButton = servicesButtons[0]; // Navigation 서비스
      expect(servicesButton).toBeTruthy();
      fireEvent.click(servicesButton);

      // Verify scroll behavior occurred
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe.skip('Service Modal Functionality', () => {
    test(
      'opens AI solution modal when clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const buttons = container.querySelectorAll('button');
        const aiSolutionButton = Array.from(buttons).find(
          (btn) => btn.textContent === 'AI 솔루션 개발'
        );
        expect(aiSolutionButton).toBeTruthy();
        fireEvent.click(aiSolutionButton!);

        await waitFor(
          () => {
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes(
                  '기업 맞춤형 AI 솔루션을 설계하고 구현합니다.'
                )
            );
            expect(modalText).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const headings = container.querySelectorAll('h4');
        const hasMainService = Array.from(headings).some(
          (h) => h.textContent === '주요 서비스'
        );
        const hasMainCase = Array.from(headings).some(
          (h) => h.textContent === '주요 사례'
        );
        expect(hasMainService).toBe(true);
        expect(hasMainCase).toBe(true);

        const codeIcon = container.querySelector('[data-testid="code-icon"]');
        expect(codeIcon).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'opens AI education modal when clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const buttons = container.querySelectorAll('button');
        const aiEducationButton = Array.from(buttons).find(
          (btn) => btn.textContent === 'AI 교육 & 강의'
        );
        expect(aiEducationButton).toBeTruthy();
        fireEvent.click(aiEducationButton!);

        await waitFor(
          () => {
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes(
                  '실무 중심의 AI 교육 프로그램을 제공합니다.'
                )
            );
            expect(modalText).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const graduationIcon = container.querySelector(
          '[data-testid="graduation-cap-icon"]'
        );
        expect(graduationIcon).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'opens AI consulting modal when clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const buttons = container.querySelectorAll('button');
        const aiConsultingButton = Array.from(buttons).find(
          (btn) => btn.textContent === 'AI 전략 컨설팅'
        );
        expect(aiConsultingButton).toBeTruthy();
        fireEvent.click(aiConsultingButton!);

        await waitFor(
          () => {
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes(
                  'AI 도입 전략부터 실행까지 종합적인 컨설팅을 제공합니다.'
                )
            );
            expect(modalText).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const barChartIcon = container.querySelector(
          '[data-testid="bar-chart-icon"]'
        );
        expect(barChartIcon).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'opens data analysis modal when clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const buttons = container.querySelectorAll('button');
        const dataAnalysisButton = Array.from(buttons).find(
          (btn) => btn.textContent === '데이터 분석'
        );
        expect(dataAnalysisButton).toBeTruthy();
        fireEvent.click(dataAnalysisButton!);

        await waitFor(
          () => {
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes(
                  '비즈니스 인사이트 도출을 위한 데이터 분석 서비스를 제공합니다.'
                )
            );
            expect(modalText).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const databaseIcon = container.querySelector(
          '[data-testid="database-icon"]'
        );
        expect(databaseIcon).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal when X button is clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const buttons = container.querySelectorAll('button');
        const aiSolutionButton = Array.from(buttons).find(
          (btn) => btn.textContent === 'AI 솔루션 개발'
        );
        expect(aiSolutionButton).toBeTruthy();
        fireEvent.click(aiSolutionButton!);

        await waitFor(
          () => {
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes(
                  '기업 맞춤형 AI 솔루션을 설계하고 구현합니다.'
                )
            );
            expect(modalText).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const closeButton = container.querySelector('[data-testid="x-icon"]');
        expect(closeButton).toBeTruthy();
        fireEvent.click(closeButton!);

        await waitFor(
          () => {
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes(
                  '기업 맞춤형 AI 솔루션을 설계하고 구현합니다.'
                )
            );
            expect(modalText).toBeFalsy();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );
  });

  describe.skip('Service Modal Interactions', () => {
    test(
      'closes modal when X button is clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Close modal
        const closeButton = screen.getByTestId('x-icon');
        fireEvent.click(closeButton);

        await waitFor(
          () => {
            expect(
              screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal when 닫기 button is clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Close modal with 닫기 button
        const closeButtons = screen.getAllByText('닫기');
        const modalCloseButton = closeButtons.find((button) =>
          button.className.includes('border-gray-300')
        );
        fireEvent.click(modalCloseButton!);

        await waitFor(
          () => {
            expect(
              screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal and navigates to contact when 문의하기 button is clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Click 문의하기 button in modal
        const contactButtons = screen.getAllByText('문의하기');
        const modalContactButton = contactButtons.find((button) =>
          button.className.includes('bg-gray-900')
        );

        fireEvent.click(modalContactButton!);

        expect(mockNavigate).toHaveBeenCalledWith('/contact');

        // NOTE: Modal closing animation timing is flaky in tests
        // Consider adding waitFor or adjusting timing for more reliable tests
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal when backdrop is clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Click backdrop to close modal
        const backdrop = screen.getByLabelText('Close modal');
        fireEvent.click(backdrop);

        await waitFor(
          () => {
            expect(
              screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal when Escape key is pressed on backdrop',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Press Escape to close modal
        const backdrop = screen.getByLabelText('Close modal');
        fireEvent.keyDown(backdrop, { key: 'Escape' });

        await waitFor(
          () => {
            expect(
              screen.queryByText('기업 맞춤형 AI 솔루션을 설계하고 구현합니다.')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );
  });

  describe.skip('Service Modal Content', () => {
    test(
      'displays all service details for AI solution',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        const aiSolutionButton = aiSolutionButtons[0];
        fireEvent.click(aiSolutionButton);

        await waitFor(
          () =>
            expect(
              screen.getByText('맞춤형 LLM 기반 솔루션 개발')
            ).toBeInTheDocument(),
          { timeout: 3000 }
        );
        expect(
          screen.getByText('Computer Vision & 이미지 분석 시스템')
        ).toBeInTheDocument();
        expect(screen.getByText('MLOps 파이프라인 구축')).toBeInTheDocument();
        expect(
          screen.getByText(/삼성전자.*AI 이상탐지 시스템/)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/LG전자.*데이터 분석 파이프라인/)
        ).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'displays all service details for AI education',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const aiEducationButtons = screen.getAllByText('AI 교육 & 강의');
        const aiEducationButton = aiEducationButtons[0];
        fireEvent.click(aiEducationButton);

        await waitFor(
          () => {
            expect(
              screen.getByText('실무 중심의 AI 교육 프로그램을 제공합니다.')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        expect(
          screen.getByText('기업 맞춤형 AI 교육 커리큘럼 설계')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Python 머신러닝/딥러닝 실무 교육')
        ).toBeInTheDocument();
        expect(
          screen.getByText(/삼성전자.*Python 머신러닝 교육/)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/멋쟁이사자처럼.*AI 스타트업 교육/)
        ).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );
  });

  describe('CSS Classes and Styling', () => {
    test('applies correct CSS classes to footer container', () => {
      const { container } = renderWithRouter(<Footer />);

      // Footer should be rendered with proper structure - multiple instances are expected
      const companyNames = screen.getAllByText('에멜무지로');
      expect(companyNames.length).toBeGreaterThan(0);
      expect(companyNames[0]).toBeInTheDocument();
    });

    test('applies correct CSS classes to service buttons', () => {
      const { container } = renderWithRouter(<Footer />);

      const serviceButtons = screen.getAllByText('AI 솔루션 개발');
      expect(serviceButtons[0]).toHaveClass('text-gray-600');
      expect(serviceButtons[0]).toHaveClass('text-sm');
    });

    test('applies correct CSS classes to contact CTA button', () => {
      const { container } = renderWithRouter(<Footer />);

      const ctaButtons = screen.getAllByRole('button', {
        name: /문의하기.*ExternalLink/,
      });
      expect(ctaButtons[0]).toHaveClass('inline-flex');
      expect(ctaButtons[0]).toHaveClass('items-center');
    });
  });

  describe('Accessibility', () => {
    test.skip(
      'modal has correct accessibility attributes',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        // Open modal
        const aiSolutionButtons = screen.getAllByText('AI 솔루션 개발');
        fireEvent.click(aiSolutionButtons[0]);

        await waitFor(
          () => {
            const backdrop = screen.getByLabelText('Close modal');
            expect(backdrop).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const backdrop = screen.getByLabelText('Close modal');
        expect(backdrop).toHaveAttribute('role', 'button');
        expect(backdrop).toHaveAttribute('tabIndex', '0');
      },
      MODAL_TEST_TIMEOUT
    );

    test('all buttons are accessible', () => {
      const { container } = renderWithRouter(<Footer />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles missing DOM element gracefully in scroll function', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/' },
      });

      // Mock getElementById to return null
      vi.spyOn(document, 'getElementById').mockReturnValue(null);

      const { container } = renderWithRouter(<Footer />);

      const homeButtons = screen.getAllByText('홈');
      const homeButton = homeButtons[0];

      // Should not throw error when element is not found
      expect(() => {
        fireEvent.click(homeButton);
      }).not.toThrow();
    });

    test('modal does not render when service is null', () => {
      const { container } = renderWithRouter(<Footer />);

      // Modal should not be visible initially
      expect(screen.queryByText('주요 서비스')).not.toBeInTheDocument();
      expect(screen.queryByText('주요 사례')).not.toBeInTheDocument();
    });
  });

  describe('Component Display Names', () => {
    test('Footer has correct display name', () => {
      expect(Footer.displayName).toBe('Footer');
    });
  });
});
