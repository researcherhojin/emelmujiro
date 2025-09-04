import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AppUpdateNotification from '../AppUpdateNotification';

// Type definitions for mock objects
interface MockServiceWorker {
  state:
    | 'parsed'
    | 'installing'
    | 'installed'
    | 'activating'
    | 'activated'
    | 'redundant';
  postMessage: any;
  onstatechange: ((this: ServiceWorker, ev: Event) => void) | null;
}

interface MockRegistration {
  waiting: ServiceWorker | null;
  installing: ServiceWorker | null;
  addEventListener: any;
  removeEventListener: any;
}

describe('AppUpdateNotification', () => {
  let originalServiceWorker: ServiceWorkerContainer | undefined;
  let mockRegistration: MockRegistration;

  beforeEach(() => {
    // Save original service worker
    originalServiceWorker = navigator.serviceWorker;

    // Mock service worker
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: {
        controller: { state: 'activated' },
        ready: Promise.resolve({
          update: vi.fn(),
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    // Mock registration
    mockRegistration = {
      waiting: null,
      installing: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  afterEach(() => {
    // Restore original service worker
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: originalServiceWorker,
    });
  });

  it('renders without crashing', () => {
    render(
      <AppUpdateNotification
        registration={mockRegistration as unknown as ServiceWorkerRegistration}
      />
    );
    // Component should render but not show notification initially
    expect(screen.queryByText(/새로운 버전/i)).not.toBeInTheDocument();
  });

  it.skip('shows notification when update is available', async () => {
    // Set up a waiting worker
    const mockWaitingWorker: MockServiceWorker = {
      state: 'installed',
      postMessage: vi.fn(),
      onstatechange: null,
    };
    mockRegistration.waiting = mockWaitingWorker as unknown as ServiceWorker;

    render(
      <AppUpdateNotification
        registration={mockRegistration as unknown as ServiceWorkerRegistration}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/새로운 버전이 있습니다/i)).toBeInTheDocument();
    });
  });

  it('handles update button click', async () => {
    const mockReload = vi.fn();
    Object.defineProperty(window.location, 'reload', {
      configurable: true,
      value: mockReload,
    });

    const mockWaitingWorker: MockServiceWorker = {
      state: 'installed',
      postMessage: vi.fn(),
      onstatechange: null,
    };
    mockRegistration.waiting = mockWaitingWorker as unknown as ServiceWorker;

    render(
      <AppUpdateNotification
        registration={mockRegistration as unknown as ServiceWorkerRegistration}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/새로운 버전이 있습니다/i)).toBeInTheDocument();
    });

    // Click update button - be more specific
    const updateButton = screen.getByText('지금 업데이트');
    fireEvent.click(updateButton);

    // Should post message to waiting worker
    expect(mockWaitingWorker.postMessage).toHaveBeenCalledWith({
      type: 'SKIP_WAITING',
    });

    // Simulate controller change
    const controllerChangeHandler = (
      navigator.serviceWorker.addEventListener as any
    ).mock.calls.find((call: any) => call[0] === 'controllerchange');

    // Assert controller change handler exists before using it
    expect(controllerChangeHandler).toBeDefined();

    // Call the handler and verify reload
    controllerChangeHandler![1]();
    expect(mockReload).toHaveBeenCalled();
  });

  it('handles dismiss button click', async () => {
    const mockWaitingWorker: MockServiceWorker = {
      state: 'installed',
      postMessage: vi.fn(),
      onstatechange: null,
    };
    mockRegistration.waiting = mockWaitingWorker as unknown as ServiceWorker;

    render(
      <AppUpdateNotification
        registration={mockRegistration as unknown as ServiceWorkerRegistration}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/새로운 버전이 있습니다/i)).toBeInTheDocument();
    });

    // Click dismiss button - use specific text
    const dismissButton = screen.getByText('나중에');
    fireEvent.click(dismissButton);

    // Notification should be hidden
    expect(
      screen.queryByText(/새로운 버전이 있습니다/i)
    ).not.toBeInTheDocument();
  });

  it('cleans up event listener on unmount', () => {
    const { unmount } = render(
      <AppUpdateNotification
        registration={mockRegistration as unknown as ServiceWorkerRegistration}
      />
    );

    unmount();

    expect(mockRegistration.removeEventListener).toHaveBeenCalledWith(
      'updatefound',
      expect.any(Function)
    );
  });

  it('handles missing registration gracefully', () => {
    // Should not throw error
    expect(() => render(<AppUpdateNotification />)).not.toThrow();
  });
});
