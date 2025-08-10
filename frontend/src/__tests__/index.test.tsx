import React from 'react';
import ReactDOM from 'react-dom/client';

// Mock the required modules before importing index
jest.mock('react-helmet-async', () => ({
  HelmetProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../utils/performanceMonitoring', () => ({
  initWebVitals: jest.fn(),
  PerformanceMonitor: jest.fn(),
}));

jest.mock('../serviceWorkerRegistration', () => ({
  register: jest.fn(),
}));

describe('Index', () => {
  let rootElement: HTMLDivElement;
  let consoleErrorSpy: jest.SpyInstance;
  let mockRender: jest.Mock;
  let mockCreateRoot: jest.Mock;

  beforeEach(() => {
    // Create a div with id 'root'
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    // Create mock functions
    mockRender = jest.fn();
    mockCreateRoot = jest.fn(() => ({
      render: mockRender,
    }));

    // Mock ReactDOM.createRoot
    jest.spyOn(ReactDOM, 'createRoot').mockImplementation(mockCreateRoot);

    // Clear all mocks
    jest.clearAllMocks();

    // Spy on console.error to suppress error output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock window.location for HashRouter
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: {
        hash: '#/',
        pathname: '/',
        href: 'http://localhost/#/',
        origin: 'http://localhost',
        hostname: 'localhost',
        port: '',
        protocol: 'http:',
        search: '',
        reload: jest.fn(),
      },
    });
  });

  afterEach(() => {
    // Clean up
    if (document.body.contains(rootElement)) {
      document.body.removeChild(rootElement);
    }

    // Restore mocks
    jest.restoreAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it('renders without crashing', () => {
    // Mock App component to avoid router initialization issues
    jest.doMock('../App', () => {
      return {
        __esModule: true,
        default: () => <div>Mock App</div>,
      };
    });

    // Import index.tsx which will execute the rendering code
    jest.isolateModules(() => {
      require('../index');
    });

    // Check that createRoot was called with the root element
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootElement);

    // Check that render was called
    expect(mockRender).toHaveBeenCalled();

    // Clean up mock
    jest.dontMock('../App');
  });

  it('registers service worker', () => {
    const { register } = require('../serviceWorkerRegistration');

    jest.isolateModules(() => {
      require('../index');
    });

    expect(register).toHaveBeenCalled();

    // Check that the onUpdate and onSuccess callbacks were provided
    const registerCall = register.mock.calls[0][0];
    expect(registerCall).toHaveProperty('onUpdate');
    expect(registerCall).toHaveProperty('onSuccess');
  });

  it('initializes performance monitoring', () => {
    const { initWebVitals, PerformanceMonitor } = require('../utils/performanceMonitoring');

    jest.isolateModules(() => {
      require('../index');
    });

    expect(initWebVitals).toHaveBeenCalled();
    expect(PerformanceMonitor).toHaveBeenCalled();
  });

  it('renders App component in StrictMode with HelmetProvider', () => {
    // Mock App component to avoid router initialization issues
    jest.doMock('../App', () => {
      return {
        __esModule: true,
        default: () => <div>Mock App</div>,
      };
    });

    jest.isolateModules(() => {
      require('../index');
    });

    expect(mockRender).toHaveBeenCalled();

    const renderCall = mockRender.mock.calls[0][0];

    // Check that StrictMode is used
    expect(renderCall.type).toBe(React.StrictMode);

    // Check that HelmetProvider wraps the App
    const helmetProvider = renderCall.props.children;
    expect(helmetProvider.type.name).toBe('HelmetProvider');

    // Clean up mock
    jest.dontMock('../App');
  });

  it('throws error when root element is missing', () => {
    // Remove the root element
    document.body.removeChild(rootElement);

    // Should throw an error
    expect(() => {
      jest.isolateModules(() => {
        require('../index');
      });
    }).toThrow('Failed to find the root element');
  });

  it('handles service worker update callback', () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const { register } = require('../serviceWorkerRegistration');

    jest.isolateModules(() => {
      require('../index');
    });

    // Get the onUpdate callback
    const registerCall = register.mock.calls[0][0];
    const mockRegistration = {} as ServiceWorkerRegistration;

    // Call the onUpdate callback
    registerCall.onUpdate(mockRegistration);

    expect(mockConfirm).toHaveBeenCalledWith(
      '새로운 버전이 있습니다. 페이지를 새로고침하시겠습니까?'
    );
    expect(window.location.reload).toHaveBeenCalled();

    mockConfirm.mockRestore();
  });

  it('handles service worker update cancellation', () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const { register } = require('../serviceWorkerRegistration');

    jest.isolateModules(() => {
      require('../index');
    });

    // Get the onUpdate callback
    const registerCall = register.mock.calls[0][0];
    const mockRegistration = {} as ServiceWorkerRegistration;

    // Call the onUpdate callback
    registerCall.onUpdate(mockRegistration);

    expect(mockConfirm).toHaveBeenCalledWith(
      '새로운 버전이 있습니다. 페이지를 새로고침하시겠습니까?'
    );
    expect(window.location.reload).not.toHaveBeenCalled();

    mockConfirm.mockRestore();
  });
});
