import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ServiceModal from '../ServiceModal';
import type { ServiceDetail } from '../../../data/footerData';

vi.mock('../../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

const MockIcon = (props: React.SVGProps<SVGSVGElement>) =>
  React.createElement('svg', { ...props, 'data-testid': 'service-icon' });

const mockService: ServiceDetail = {
  title: 'AI Education',
  icon: MockIcon as unknown as ServiceDetail['icon'],
  description: 'AI education service description',
  details: ['Detail 1', 'Detail 2', 'Detail 3'],
};

const mockService2: ServiceDetail = {
  title: 'AI Consulting',
  icon: MockIcon as unknown as ServiceDetail['icon'],
  description: 'AI consulting description',
  details: ['Consulting Detail 1'],
};

const mockServices: ServiceDetail[] = [mockService];
const multiServices: ServiceDetail[] = [mockService, mockService2];

describe('ServiceModal', () => {
  const onClose = vi.fn();
  const onContactClick = vi.fn();
  const onNavigate = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    onContactClick.mockClear();
    onNavigate.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ServiceModal
        isOpen={false}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when services array is empty', () => {
    const { container } = render(
      <ServiceModal
        isOpen={true}
        services={[]}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders modal content when open with service', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('AI Education')).toBeInTheDocument();
    expect(screen.getByText('AI education service description')).toBeInTheDocument();
  });

  it('renders service details list', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    expect(screen.getByText('Detail 1')).toBeInTheDocument();
    expect(screen.getByText('Detail 2')).toBeInTheDocument();
    expect(screen.getByText('Detail 3')).toBeInTheDocument();
  });

  it('renders service icon', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    expect(screen.getByTestId('service-icon')).toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'AI Education');
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    const closeButton = screen.getByLabelText('accessibility.closeModal');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    const overlay = screen.getByLabelText('accessibility.closeModalOverlay');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed on overlay', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    const overlay = screen.getByLabelText('accessibility.closeModalOverlay');
    fireEvent.keyDown(overlay, { key: 'Escape' });
    // Document-level + overlay Escape handlers may both fire
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose for non-Escape keys on overlay', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    const overlay = screen.getByLabelText('accessibility.closeModalOverlay');
    fireEvent.keyDown(overlay, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onContactClick when contact button is clicked', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    fireEvent.click(screen.getByText('common.contact'));
    expect(onContactClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "close" text button is clicked', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    fireEvent.click(screen.getByText('common.close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates via prev/next arrows and dot indicators', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={multiServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    // Next arrow (hidden on mobile but rendered in DOM for sm+)
    const nextButton = screen.getByLabelText('Next service');
    fireEvent.click(nextButton);
    expect(onNavigate).toHaveBeenCalledWith(1);

    // Dot indicator click
    onNavigate.mockClear();
    const dots = screen.getAllByLabelText(/Service \d/);
    fireEvent.click(dots[1]);
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('navigates via prev arrow when not on first service', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={multiServices}
        currentIndex={1}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    const prevButton = screen.getByLabelText('Previous service');
    fireEvent.click(prevButton);
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('navigates with Arrow keys', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={multiServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenCalledWith(1);

    onNavigate.mockClear();
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    // currentIndex is 0, no prev — onNavigate should NOT be called
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('traps focus — Tab on last element wraps to first', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    const dialog = screen.getByRole('dialog');
    const buttons = dialog.querySelectorAll('button');
    const lastButton = buttons[buttons.length - 1] as HTMLElement;

    lastButton.focus();
    expect(document.activeElement).toBe(lastButton);
    fireEvent.keyDown(dialog, { key: 'Tab' });
  });

  it('traps focus — Shift+Tab on first element wraps to last', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    const dialog = screen.getByRole('dialog');
    const focusable = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusable[0] as HTMLElement;

    firstEl.focus();
    expect(document.activeElement).toBe(firstEl);
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
  });

  it('renders main services heading', () => {
    render(
      <ServiceModal
        isOpen={true}
        services={mockServices}
        currentIndex={0}
        onNavigate={onNavigate}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    expect(screen.getByText('footer.mainServices')).toBeInTheDocument();
  });

  describe('swipe and horizontal wheel navigation', () => {
    const renderAt = (currentIndex: number) => {
      render(
        <ServiceModal
          isOpen={true}
          services={multiServices}
          currentIndex={currentIndex}
          onNavigate={onNavigate}
          onClose={onClose}
          onContactClick={onContactClick}
        />
      );
      return screen.getByTestId('service-modal-panel');
    };

    const swipe = (panel: HTMLElement, dx: number, dy = 0) => {
      fireEvent.touchStart(panel, { touches: [{ clientX: 200, clientY: 200 }] });
      fireEvent.touchEnd(panel, {
        changedTouches: [{ clientX: 200 + dx, clientY: 200 + dy }],
      });
    };

    it('swiping left goes to the next service', () => {
      swipe(renderAt(0), -80);
      expect(onNavigate).toHaveBeenCalledWith(1);
    });

    it('swiping right goes to the previous service', () => {
      swipe(renderAt(1), 80);
      expect(onNavigate).toHaveBeenCalledWith(0);
    });

    it('ignores a swipe shorter than the threshold', () => {
      swipe(renderAt(0), -20);
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('ignores a mostly vertical swipe so page scrolling still works', () => {
      swipe(renderAt(0), -60, -200);
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('ignores touchEnd without a preceding touchStart', () => {
      const panel = renderAt(0);
      fireEvent.touchEnd(panel, { changedTouches: [{ clientX: 0, clientY: 200 }] });
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('scrolling horizontally right goes to the next service', () => {
      fireEvent.wheel(renderAt(0), { deltaX: 60, deltaY: 0 });
      expect(onNavigate).toHaveBeenCalledWith(1);
    });

    it('scrolling horizontally left goes to the previous service', () => {
      fireEvent.wheel(renderAt(1), { deltaX: -60, deltaY: 0 });
      expect(onNavigate).toHaveBeenCalledWith(0);
    });

    it('ignores a mostly vertical wheel event', () => {
      fireEvent.wheel(renderAt(0), { deltaX: 10, deltaY: 100 });
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('accumulates small horizontal deltas within one gesture', () => {
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_000);
      const panel = renderAt(0);

      fireEvent.wheel(panel, { deltaX: 25, deltaY: 0 });
      expect(onNavigate).not.toHaveBeenCalled();

      nowSpy.mockReturnValue(1_050);
      fireEvent.wheel(panel, { deltaX: 25, deltaY: 0 });
      expect(onNavigate).toHaveBeenCalledWith(1);

      nowSpy.mockRestore();
    });

    it('ignores the momentum tail right after navigating', () => {
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_000);
      const panel = renderAt(0);

      fireEvent.wheel(panel, { deltaX: 60, deltaY: 0 });
      expect(onNavigate).toHaveBeenCalledTimes(1);

      nowSpy.mockReturnValue(1_100);
      fireEvent.wheel(panel, { deltaX: 60, deltaY: 0 });
      expect(onNavigate).toHaveBeenCalledTimes(1);

      nowSpy.mockRestore();
    });

    it('discards leftover delta when a gesture pauses', () => {
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_000);
      const panel = renderAt(0);

      fireEvent.wheel(panel, { deltaX: 30, deltaY: 0 });
      expect(onNavigate).not.toHaveBeenCalled();

      // 500 ms later: a new gesture, so the earlier 30 px must not count
      nowSpy.mockReturnValue(1_500);
      fireEvent.wheel(panel, { deltaX: 30, deltaY: 0 });
      expect(onNavigate).not.toHaveBeenCalled();

      nowSpy.mockRestore();
    });
  });
});
