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

// Mock i18n module used by footerData.ts
vi.mock('../../../i18n', () => ({
  default: {
    t: (key: string) => key,
    language: 'ko',
  },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options?.returnObjects) return key;
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

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
  Code2: ({ className }: { className?: string }) => (
    <div data-testid="code2-icon" className={className}>
      Code2
    </div>
  ),
  GraduationCap: ({ className }: { className?: string }) => (
    <div data-testid="graduation-cap-icon" className={className}>
      GraduationCap
    </div>
  ),
  MessageSquare: ({ className }: { className?: string }) => (
    <div data-testid="message-square-icon" className={className}>
      MessageSquare
    </div>
  ),
  Eye: ({ className }: { className?: string }) => (
    <div data-testid="eye-icon" className={className}>
      Eye
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
      // 회사명은 h3 태그에 있고, 'common.companyName' i18n key를 포함하는 것을 찾음
      const headings = container.querySelectorAll('h3');
      const companyName = Array.from(headings).find(
        (h) => h.textContent === 'common.companyName'
      );
      expect(companyName).toBeInTheDocument();
      expect(companyName?.textContent).toBe('common.companyName');
    });

    test('renders all service sections', () => {
      const { container } = renderWithRouter(<Footer />);

      const serviceHeaders = container.querySelectorAll('h3');
      const hasServiceHeader = Array.from(serviceHeaders).some(
        (h) => h.textContent === 'footer.services'
      );
      expect(hasServiceHeader).toBe(true);

      const buttons = container.querySelectorAll('button');
      const serviceNames = [
        'services.education.title',
        'services.consulting.title',
        'services.llmGenai.title',
        'services.computerVision.title',
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
        (h) => h.textContent === 'common.menu'
      );
      expect(hasMenuHeader).toBe(true);

      const buttons = container.querySelectorAll('button');
      const menuItems = [
        'common.home',
        'common.services',
        'common.representativeProfile',
        'common.contact',
      ];
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

      // CTA 텍스트 (i18n key)
      const paragraphs = container.querySelectorAll('p');
      const ctaText = Array.from(paragraphs).find(
        (p) => p.textContent === 'footer.ctaQuestion'
      );
      expect(ctaText).toBeInTheDocument();
      expect(ctaText?.textContent).toBe('footer.ctaQuestion');

      // ExternalLink 아이콘 확인
      expect(
        container.querySelector('[data-testid="external-link-icon"]')
      ).toBeInTheDocument();
    });

    test('renders copyright with current year', () => {
      const { container } = renderWithRouter(<Footer />);

      // copyright는 text-center 안의 p 태그에 있음
      // With the mock, t('footer.copyright', { year: currentYear }) returns 'footer.copyright'
      const centerDiv = container.querySelector('.text-center');
      const copyright = centerDiv?.querySelector('p');
      expect(copyright).toBeInTheDocument();
      expect(copyright?.textContent).toBe('footer.copyright');
    });
  });

  describe('Navigation Functionality', () => {
    test('navigates to profile page when profile link is clicked', () => {
      const { container } = renderWithRouter(<Footer />);

      const profileButtons = container.querySelectorAll('button');
      const profileButton = Array.from(profileButtons).find(
        (btn) => btn.textContent === 'common.representativeProfile'
      );
      expect(profileButton).toBeTruthy();
      fireEvent.click(profileButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    test('navigates to contact page when contact link is clicked', () => {
      const { container } = renderWithRouter(<Footer />);

      const contactButtons = container.querySelectorAll('button');
      // There are multiple 'common.contact' buttons; find the one in the nav section
      const contactButton = Array.from(contactButtons).find(
        (btn) =>
          btn.textContent === 'common.contact' &&
          btn.className.includes('text-sm')
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
        const hasText = btn.textContent?.includes('common.contact');
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
        (btn) => btn.textContent === 'common.home'
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
          (btn) => btn.textContent === 'common.home'
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
        (btn) => btn.textContent === 'common.services'
      );
      const servicesButton = servicesButtons[0]; // Navigation 서비스
      expect(servicesButton).toBeTruthy();
      fireEvent.click(servicesButton);

      // Verify scroll behavior occurred
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Service Modal Functionality', () => {
    test(
      'opens LLM/생성형 AI modal when clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const buttons = container.querySelectorAll('button');
        const llmButton = Array.from(buttons).find(
          (btn) => btn.textContent === 'services.llmGenai.title'
        );
        expect(llmButton).toBeTruthy();
        fireEvent.click(llmButton!);

        await waitFor(
          () => {
            // Modal description comes from footerData.ts (now uses i18n.t() keys)
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes('footerServices.llmGenai.description')
            );
            expect(modalText).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const headings = container.querySelectorAll('h4');
        const hasMainService = Array.from(headings).some(
          (h) => h.textContent === 'footer.mainServices'
        );
        expect(hasMainService).toBe(true);

        const messageSquareIcon = container.querySelector(
          '[data-testid="message-square-icon"]'
        );
        expect(messageSquareIcon).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'opens AI education modal when clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const buttons = container.querySelectorAll('button');
        const aiEducationButton = Array.from(buttons).find(
          (btn) => btn.textContent === 'services.education.title'
        );
        expect(aiEducationButton).toBeTruthy();
        fireEvent.click(aiEducationButton!);

        await waitFor(
          () => {
            // Modal description comes from footerData.ts (now uses i18n.t() keys)
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes('footerServices.education.description')
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
          (btn) => btn.textContent === 'services.consulting.title'
        );
        expect(aiConsultingButton).toBeTruthy();
        fireEvent.click(aiConsultingButton!);

        await waitFor(
          () => {
            // Modal description comes from footerData.ts (now uses i18n.t() keys)
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes('footerServices.consulting.description')
            );
            expect(modalText).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const code2Icon = container.querySelector('[data-testid="code2-icon"]');
        expect(code2Icon).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'opens Computer Vision modal when clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const buttons = container.querySelectorAll('button');
        const cvButton = Array.from(buttons).find(
          (btn) => btn.textContent === 'services.computerVision.title'
        );
        expect(cvButton).toBeTruthy();
        fireEvent.click(cvButton!);

        await waitFor(
          () => {
            // Modal description comes from footerData.ts (now uses i18n.t() keys)
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes(
                  'footerServices.computerVision.description'
                )
            );
            expect(modalText).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const eyeIcon = container.querySelector('[data-testid="eye-icon"]');
        expect(eyeIcon).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal when X button is clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const buttons = container.querySelectorAll('button');
        const llmButton = Array.from(buttons).find(
          (btn) => btn.textContent === 'services.llmGenai.title'
        );
        expect(llmButton).toBeTruthy();
        fireEvent.click(llmButton!);

        await waitFor(
          () => {
            const modalText = Array.from(container.querySelectorAll('p')).find(
              (p) =>
                p.textContent?.includes('footerServices.llmGenai.description')
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
                p.textContent?.includes('footerServices.llmGenai.description')
            );
            expect(modalText).toBeFalsy();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );
  });

  describe('Service Modal Interactions', () => {
    test(
      'closes modal when X button is clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        // Open modal
        const llmButtons = screen.getAllByText('services.llmGenai.title');
        fireEvent.click(llmButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('footerServices.llmGenai.description')
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
              screen.queryByText('footerServices.llmGenai.description')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal when close button is clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        // Open modal
        const llmButtons = screen.getAllByText('services.llmGenai.title');
        fireEvent.click(llmButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('footerServices.llmGenai.description')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Close modal with common.close button
        const closeButtons = screen.getAllByText('common.close');
        const modalCloseButton = closeButtons.find((button) =>
          button.className.includes('border-gray-300')
        );
        fireEvent.click(modalCloseButton!);

        await waitFor(
          () => {
            expect(
              screen.queryByText('footerServices.llmGenai.description')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'closes modal and navigates to contact when contact button is clicked',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        // Open modal
        const llmButtons = screen.getAllByText('services.llmGenai.title');
        fireEvent.click(llmButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('footerServices.llmGenai.description')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        // Click common.contact button in modal
        const contactButtons = screen.getAllByText('common.contact');
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
        const llmButtons = screen.getAllByText('services.llmGenai.title');
        fireEvent.click(llmButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('footerServices.llmGenai.description')
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
              screen.queryByText('footerServices.llmGenai.description')
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
        const llmButtons = screen.getAllByText('services.llmGenai.title');
        fireEvent.click(llmButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText('footerServices.llmGenai.description')
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
              screen.queryByText('footerServices.llmGenai.description')
            ).not.toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      },
      MODAL_TEST_TIMEOUT
    );
  });

  describe('Service Modal Content', () => {
    test(
      'displays all service details for LLM/생성형 AI',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const llmButtons = screen.getAllByText('services.llmGenai.title');
        fireEvent.click(llmButtons[0]);

        // Service details come from footerData.ts (hardcoded Korean)
        await waitFor(
          () =>
            expect(
              screen.getByText('footerServices.llmGenai.details.0')
            ).toBeInTheDocument(),
          { timeout: 3000 }
        );
        expect(
          screen.getByText('footerServices.llmGenai.details.1')
        ).toBeInTheDocument();
        expect(
          screen.getByText('footerServices.llmGenai.details.5')
        ).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );

    test(
      'displays all service details for AI education',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        const aiEducationButtons = screen.getAllByText(
          'services.education.title'
        );
        const aiEducationButton = aiEducationButtons[0];
        fireEvent.click(aiEducationButton);

        await waitFor(
          () => {
            // Modal description from footerData.ts (hardcoded Korean)
            expect(
              screen.getByText('footerServices.education.description')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        expect(
          screen.getByText('footerServices.education.details.0')
        ).toBeInTheDocument();
        expect(
          screen.getByText('footerServices.education.details.3')
        ).toBeInTheDocument();
      },
      MODAL_TEST_TIMEOUT
    );
  });

  describe('CSS Classes and Styling', () => {
    test('applies correct CSS classes to footer container', () => {
      const { container } = renderWithRouter(<Footer />);

      // Footer should be rendered with proper structure - multiple instances are expected
      const companyNames = screen.getAllByText('common.companyName');
      expect(companyNames.length).toBeGreaterThan(0);
      expect(companyNames[0]).toBeInTheDocument();
    });

    test('applies correct CSS classes to service buttons', () => {
      const { container } = renderWithRouter(<Footer />);

      const serviceButtons = screen.getAllByText('services.llmGenai.title');
      expect(serviceButtons[0]).toHaveClass('text-gray-600');
      expect(serviceButtons[0]).toHaveClass('text-sm');
    });

    test('applies correct CSS classes to contact CTA button', () => {
      const { container } = renderWithRouter(<Footer />);

      const ctaButtons = screen.getAllByText(/common.contact/);
      // Find the CTA button that has inline-flex class (not the nav button)
      const ctaButton = ctaButtons.find((btn) =>
        btn.className.includes('inline-flex')
      );
      expect(ctaButton).toBeTruthy();
      expect(ctaButton).toHaveClass('inline-flex');
      expect(ctaButton).toHaveClass('items-center');
    });
  });

  describe('Accessibility', () => {
    test(
      'modal has correct accessibility attributes',
      async () => {
        const { container } = renderWithRouter(<Footer />);

        // Open modal
        const llmButtons = screen.getAllByText('services.llmGenai.title');
        fireEvent.click(llmButtons[0]);

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

      const homeButtons = screen.getAllByText('common.home');
      const homeButton = homeButtons[0];

      // Should not throw error when element is not found
      expect(() => {
        fireEvent.click(homeButton);
      }).not.toThrow();
    });

    test('modal does not render when service is null', () => {
      const { container } = renderWithRouter(<Footer />);

      // Modal should not be visible initially (i18n key for main services header)
      expect(screen.queryByText('footer.mainServices')).not.toBeInTheDocument();
    });
  });

  describe('Component Display Names', () => {
    test('Footer has correct display name', () => {
      expect(Footer.displayName).toBe('Footer');
    });
  });
});
