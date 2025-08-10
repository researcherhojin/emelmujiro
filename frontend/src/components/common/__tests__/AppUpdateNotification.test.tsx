import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppUpdateNotification from '../AppUpdateNotification';

// Type definitions for mock objects
interface MockServiceWorker {
  state: 'parsed' | 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';
  postMessage: jest.Mock;
  onstatechange: ((this: ServiceWorker, ev: Event) => void) | null;
}

interface MockRegistration {
  waiting: ServiceWorker | null;
  installing: ServiceWorker | null;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
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
          update: jest.fn(),
        }),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    });

    // Mock registration
    mockRegistration = {
      waiting: null,
      installing: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
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

  it('shows notification when update is available', async () => {
    // Set up a waiting worker
    const mockWaitingWorker: MockServiceWorker = {
      state: 'installed',
      postMessage: jest.fn(),
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
    const mockReload = jest.fn();
    Object.defineProperty(window.location, 'reload', {
      configurable: true,
      value: mockReload,
    });

    const mockWaitingWorker: MockServiceWorker = {
      state: 'installed',
      postMessage: jest.fn(),
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

    // Click update button
    const updateButton = screen.getByRole('button', { name: /지금 업데이트/i });
    fireEvent.click(updateButton);

    // Should post message to waiting worker
    expect(mockWaitingWorker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

    // Simulate controller change
    const controllerChangeHandler = (
      navigator.serviceWorker.addEventListener as jest.Mock
    ).mock.calls.find(call => call[0] === 'controllerchange');

    // Assert controller change handler exists before using it
    expect(controllerChangeHandler).toBeDefined();

    // Call the handler and verify reload
    controllerChangeHandler![1]();
    expect(mockReload).toHaveBeenCalled();
  });

  it('handles dismiss button click', async () => {
    const mockWaitingWorker: MockServiceWorker = {
      state: 'installed',
      postMessage: jest.fn(),
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

    // Click dismiss button
    const dismissButton = screen.getByRole('button', { name: /나중에/i });
    fireEvent.click(dismissButton);

    // Notification should be hidden
    expect(screen.queryByText(/새로운 버전이 있습니다/i)).not.toBeInTheDocument();
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
