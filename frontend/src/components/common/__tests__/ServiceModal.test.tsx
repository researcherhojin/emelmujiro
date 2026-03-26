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

describe('ServiceModal', () => {
  const onClose = vi.fn();
  const onContactClick = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    onContactClick.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ServiceModal
        isOpen={false}
        service={mockService}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when service is null', () => {
    const { container } = render(
      <ServiceModal
        isOpen={true}
        service={null}
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
        service={mockService}
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
        service={mockService}
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
        service={mockService}
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
        service={mockService}
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
        service={mockService}
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
        service={mockService}
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
        service={mockService}
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
        service={mockService}
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
        service={mockService}
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
        service={mockService}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    fireEvent.click(screen.getByText('common.close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders main services heading', () => {
    render(
      <ServiceModal
        isOpen={true}
        service={mockService}
        onClose={onClose}
        onContactClick={onContactClick}
      />
    );

    expect(screen.getByText('footer.mainServices')).toBeInTheDocument();
  });
});
