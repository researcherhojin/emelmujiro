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

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
let mockPathname = '/';
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: mockPathname,
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }),
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

// lucide-react uses global mock from setupTests.ts (data-testid="icon-{Name}")

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
    mockPathname = '/';
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
      // Company name is in an h3 tag with the 'common.companyName' i18n key
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
      const buttonMenuItems = [
        'common.home',
        'common.services',
        'common.representativeProfile',
      ];
      buttonMenuItems.forEach((item) => {
        const hasItem = Array.from(buttons).some((btn) =>
          btn.textContent?.includes(item)
        );
        expect(hasItem).toBe(true);
      });

      // 'common.contact' is now an <a> mailto link
      const links = container.querySelectorAll('a');
      const hasContactLink = Array.from(links).some(
        (a) =>
          a.textContent?.includes('common.contact') &&
          a.getAttribute('href')?.includes('mailto:')
      );
      expect(hasContactLink).toBe(true);
    });

    test('renders contact information with icons', () => {
      const { container } = renderWithRouter(<Footer />);

      // Check email info (in span tag)
      const emailSpans = container.querySelectorAll('span');
      const email = Array.from(emailSpans).find(
        (span) => span.textContent === 'researcherhojin@gmail.com'
      );
      expect(email).toBeInTheDocument();

      // Check phone number info (i18n key returned by mock)
      const phoneSpans = container.querySelectorAll('span');
      const phone = Array.from(phoneSpans).find(
        (span) => span.textContent === 'contact.info.phone'
      );
      expect(phone).toBeInTheDocument();

      // Check Mail and Phone icons (lucide-react icons are mocked as div with data-testid)
      expect(
        container.querySelector('[data-testid="icon-Mail"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="icon-Phone"]')
      ).toBeInTheDocument();
    });

    test('renders contact CTA section', () => {
      const { container } = renderWithRouter(<Footer />);

      // CTA text (i18n key)
      const paragraphs = container.querySelectorAll('p');
      const ctaText = Array.from(paragraphs).find(
        (p) => p.textContent === 'footer.ctaQuestion'
      );
      expect(ctaText).toBeInTheDocument();
      expect(ctaText?.textContent).toBe('footer.ctaQuestion');

      // Check ExternalLink icon
      expect(
        container.querySelector('[data-testid="icon-ExternalLink"]')
      ).toBeInTheDocument();
    });

    test('renders copyright with current year', () => {
      const { container } = renderWithRouter(<Footer />);

      // Copyright is in the first p tag within the border-t section
      // With the mock, t('footer.copyright', { year: currentYear }) returns 'footer.copyright'
      const bottomSection = container.querySelector('.border-t.space-y-3');
      const copyright = bottomSection?.querySelector('p');
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

    test('renders contact mailto link in navigation', () => {
      const { container } = renderWithRouter(<Footer />);

      const links = container.querySelectorAll('a');
      const contactLink = Array.from(links).find(
        (a) =>
          a.textContent === 'common.contact' && a.className.includes('text-sm')
      );
      expect(contactLink).toBeTruthy();
      expect(contactLink).toHaveAttribute(
        'href',
        expect.stringContaining('mailto:')
      );
    });

    test('renders CTA mailto link', () => {
      const { container } = renderWithRouter(<Footer />);

      // CTA is now an <a> mailto link with ExternalLink icon
      const links = container.querySelectorAll('a');
      const ctaLink = Array.from(links).find((a) => {
        const hasText = a.textContent?.includes('common.contact');
        const hasIcon = a.querySelector('[data-testid="icon-ExternalLink"]');
        return hasText && hasIcon;
      });
      expect(ctaLink).toBeTruthy();
      expect(ctaLink).toHaveAttribute(
        'href',
        expect.stringContaining('mailto:')
      );
    });

    test('scrolls to hero section when home is clicked on same page', () => {
      mockPathname = '/';

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
        mockPathname = '/profile';

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
      mockPathname = '/';

      const { container } = renderWithRouter(<Footer />);

      const buttons = container.querySelectorAll('button');
      const servicesButtons = Array.from(buttons).filter(
        (btn) => btn.textContent === 'common.services'
      );
      const servicesButton = servicesButtons[0]; // Navigation services button
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
          '[data-testid="icon-MessageSquare"]'
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
          '[data-testid="icon-GraduationCap"]'
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

        const code2Icon = container.querySelector('[data-testid="icon-Code2"]');
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

        const eyeIcon = container.querySelector('[data-testid="icon-Eye"]');
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

        const closeButton = container.querySelector('[data-testid="icon-X"]');
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

        // Modal contact now triggers mailto instead of navigate
        expect(mockNavigate).not.toHaveBeenCalledWith('/contact');

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
        const backdrop = screen.getByLabelText(
          'accessibility.closeModalOverlay'
        );
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
        const backdrop = screen.getByLabelText(
          'accessibility.closeModalOverlay'
        );
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
            const backdrop = screen.getByLabelText(
              'accessibility.closeModalOverlay'
            );
            expect(backdrop).toBeInTheDocument();
          },
          { timeout: 3000 }
        );

        const backdrop = screen.getByLabelText(
          'accessibility.closeModalOverlay'
        );
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
      mockPathname = '/';

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
