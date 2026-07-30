import React, { memo, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ServiceDetail } from '../../data/footerData';

interface ServiceModalProps {
  isOpen: boolean;
  services: ServiceDetail[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
  onContactClick: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Horizontal distance a touch must travel before it counts as a swipe
const SWIPE_THRESHOLD = 50;
// Accumulated horizontal wheel delta before it counts as a navigation
const WHEEL_THRESHOLD = 40;
// Trackpad gestures emit a momentum tail — ignore it after navigating
const WHEEL_COOLDOWN_MS = 400;
// Gap between wheel events that ends a gesture, discarding leftover delta
const WHEEL_GESTURE_GAP_MS = 200;

const ServiceModal: React.FC<ServiceModalProps> = memo(
  ({ isOpen, services, currentIndex, onNavigate, onClose, onContactClick }) => {
    const { t } = useTranslation();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const service = services[currentIndex] || null;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < services.length - 1;

    const goPrev = useCallback(() => {
      /* v8 ignore next -- guarded by hasPrev; false branch is no-op */
      if (hasPrev) onNavigate(currentIndex - 1);
    }, [hasPrev, currentIndex, onNavigate]);

    const goNext = useCallback(() => {
      /* v8 ignore next -- guarded by hasNext; false branch is no-op */
      if (hasNext) onNavigate(currentIndex + 1);
    }, [hasNext, currentIndex, onNavigate]);

    // Touch swipe — the only sideways affordance on mobile, where arrows are hidden
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }, []);

    const handleTouchEnd = useCallback(
      (e: React.TouchEvent) => {
        const start = touchStartRef.current;
        if (!start) return;
        touchStartRef.current = null;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        // Taps and vertical scrolls must not navigate
        if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
        if (dx < 0) goNext();
        else goPrev();
      },
      [goNext, goPrev]
    );

    // Horizontal wheel / two-finger trackpad swipe on desktop
    const wheelRef = useRef({ accumulated: 0, lastAt: 0, lockedUntil: 0 });

    const handleWheel = useCallback(
      (e: React.WheelEvent) => {
        // Vertical intent belongs to the modal's own scrolling
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        const now = Date.now();
        const wheel = wheelRef.current;
        if (now < wheel.lockedUntil) return;
        // A pause means a new gesture — don't carry stale delta into it
        if (now - wheel.lastAt > WHEEL_GESTURE_GAP_MS) wheel.accumulated = 0;
        wheel.lastAt = now;
        wheel.accumulated += e.deltaX;
        if (Math.abs(wheel.accumulated) < WHEEL_THRESHOLD) return;
        const forward = wheel.accumulated > 0;
        wheel.accumulated = 0;
        wheel.lockedUntil = now + WHEEL_COOLDOWN_MS;
        if (forward) goNext();
        else goPrev();
      },
      [goNext, goPrev]
    );

    // Keyboard: Escape to close, Arrow keys to navigate
    useEffect(() => {
      if (!isOpen) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, goPrev, goNext]);

    // Auto-focus close button when modal opens or service changes
    useEffect(() => {
      if (isOpen && closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    }, [isOpen, currentIndex]);

    // Focus trapping
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusableElements = modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      /* v8 ignore next -- defensive: modal always has focusable buttons */
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        /* v8 ignore next 3 -- focus trap: jsdom activeElement tracking is unreliable */
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        /* v8 ignore next 3 -- focus trap: jsdom activeElement tracking is unreliable */
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }, []);

    if (!isOpen || !service) return null;

    const IconComponent = service.icon;

    return (
      // overscroll-x-contain sits on the scroll container so a horizontal swipe
      // can't chain out to the browser's back-navigation gesture
      <div
        className="fixed inset-0 z-50 overflow-y-auto overscroll-x-contain"
        role="dialog"
        aria-modal="true"
        aria-label={service?.title}
        ref={modalRef}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div
            className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            role="button"
            tabIndex={0}
            aria-label={t('accessibility.closeModalOverlay')}
          ></div>

          {/* Prev arrow — hidden on mobile, visible on sm+ */}
          {hasPrev && (
            <button
              onClick={goPrev}
              className="hidden sm:block fixed left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous service"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {/* Next arrow — hidden on mobile, visible on sm+ */}
          {hasNext && (
            <button
              onClick={goNext}
              className="hidden sm:block fixed right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
              aria-label="Next service"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {/* Swipe and horizontal-wheel target: the panel, not the overlay (overlay click closes) */}
          <div
            className="relative bg-white dark:bg-dark-900 rounded-2xl px-6 pt-6 pb-5 text-left overflow-hidden shadow-xl max-w-2xl w-full sm:p-8"
            data-testid="service-modal-panel"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                ref={closeButtonRef}
                type="button"
                className="bg-white dark:bg-dark-900 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
                onClick={onClose}
                aria-label={t('accessibility.closeModal')}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Header: icon + title + description */}
            <div className="text-center sm:text-left sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-dark-800 sm:mx-0 sm:h-10 sm:w-10">
                <IconComponent className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4 flex-1">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-base text-gray-500 dark:text-gray-400">{service.description}</p>
              </div>
            </div>

            {/* Details list */}
            <div className="mt-6 mb-6">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 text-center sm:text-left">
                {t('footer.mainServices')}
              </h4>
              <ul className="space-y-3 pl-8 sm:pl-0">
                {service.details.map((detail, index) => (
                  <li key={`detail-${index}`} className="flex items-baseline gap-3">
                    <span className="text-sm font-bold text-gray-400 dark:text-gray-500 flex-shrink-0 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mb-4">
              {services.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex
                      ? 'bg-gray-900 dark:bg-white'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                  aria-label={`Service ${i + 1}`}
                />
              ))}
            </div>

            <div className="sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-base font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none sm:ml-3 sm:w-auto"
                onClick={onContactClick}
              >
                {t('common.contact')}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-dark-600 shadow-sm px-5 py-2.5 bg-white dark:bg-dark-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none sm:mt-0 sm:w-auto"
                onClick={onClose}
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ServiceModal.displayName = 'ServiceModal';

export default ServiceModal;
