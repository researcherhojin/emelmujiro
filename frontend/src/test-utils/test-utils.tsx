import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { UIProvider } from '../contexts/UIContext';
import { BlogProvider } from '../contexts/BlogContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FormProvider } from '../contexts/FormContext';

// Define the props for all providers
interface AllProvidersProps {
  children: React.ReactNode;
  routerProps?: MemoryRouterProps;
}

// Create a wrapper component with all providers
export const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  routerProps = {},
}) => {
  return (
    <MemoryRouter {...routerProps}>
      <HelmetProvider>
        <UIProvider>
          <AuthProvider>
            <BlogProvider>
              <FormProvider>{children}</FormProvider>
            </BlogProvider>
          </AuthProvider>
        </UIProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
};

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
}

// Custom render function that includes all providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { routerProps, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders routerProps={routerProps}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
};

// Custom render function with only router
export const renderWithRouter = (
  ui: ReactElement,
  routerProps?: MemoryRouterProps,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter {...routerProps}>
        <HelmetProvider>{children}</HelmetProvider>
      </MemoryRouter>
    ),
    ...options,
  });
};

// Custom render function with specific providers
interface SelectiveProvidersProps {
  children: React.ReactNode;
  includeRouter?: boolean;
  includeHelmet?: boolean;
  includeUI?: boolean;
  includeAuth?: boolean;
  includeBlog?: boolean;
  includeForm?: boolean;
  routerProps?: MemoryRouterProps;
}

export const SelectiveProviders: React.FC<SelectiveProvidersProps> = ({
  children,
  includeRouter = true,
  includeHelmet = true,
  includeUI = false,
  includeAuth = false,
  includeBlog = false,
  includeForm = false,
  routerProps = {},
}) => {
  let result = <>{children}</>;

  if (includeForm) {
    result = <FormProvider>{result}</FormProvider>;
  }
  if (includeBlog) {
    result = <BlogProvider>{result}</BlogProvider>;
  }
  if (includeAuth) {
    result = <AuthProvider>{result}</AuthProvider>;
  }
  if (includeUI) {
    result = <UIProvider>{result}</UIProvider>;
  }
  if (includeHelmet) {
    result = <HelmetProvider>{result}</HelmetProvider>;
  }
  if (includeRouter) {
    result = <MemoryRouter {...routerProps}>{result}</MemoryRouter>;
  }

  return result;
};

// Custom render with selective providers
export const renderWithSelectiveProviders = (
  ui: ReactElement,
  options?: {
    includeRouter?: boolean;
    includeHelmet?: boolean;
    includeUI?: boolean;
    includeAuth?: boolean;
    includeBlog?: boolean;
    includeForm?: boolean;
    routerProps?: MemoryRouterProps;
    renderOptions?: Omit<RenderOptions, 'wrapper'>;
  }
) => {
  const {
    includeRouter,
    includeHelmet,
    includeUI,
    includeAuth,
    includeBlog,
    includeForm,
    routerProps,
    renderOptions = {},
  } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <SelectiveProviders
        includeRouter={includeRouter}
        includeHelmet={includeHelmet}
        includeUI={includeUI}
        includeAuth={includeAuth}
        includeBlog={includeBlog}
        includeForm={includeForm}
        routerProps={routerProps}
      >
        {children}
      </SelectiveProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything from testing library
export * from '@testing-library/react';

// Export user event
export { default as userEvent } from '@testing-library/user-event';

// Export test helpers (excluding waitFor to avoid conflict)
export {
  safeGetByRole,
  findButton,
  findHeading,
  waitForElement,
  mockIntersectionObserver,
  mockResizeObserver,
  setupCommonMocks,
} from './test-helpers';

// Test data factories
export const createMockBlogPost = (overrides = {}) => ({
  id: '1',
  title: 'Test Blog Post',
  content: 'Test content',
  excerpt: 'Test excerpt',
  author: 'Test Author',
  date: '2024-01-01',
  category: 'Test Category',
  tags: ['test', 'mock'],
  image: '/test-image.jpg',
  readTime: 5,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  avatar: '/test-avatar.jpg',
  ...overrides,
});

export const createMockComment = (overrides = {}) => ({
  id: '1',
  postId: '1',
  author: 'Test Commenter',
  content: 'Test comment content',
  date: '2024-01-01',
  likes: 0,
  ...overrides,
});

// Mock handlers for common scenarios
export const mockSuccessResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  json: async () => data,
});

export const mockErrorResponse = (status: number, message: string) => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
});

// Wait utilities
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Custom matchers
export const expectToHaveBeenCalledWithPartial = (
  mock: { mock: { calls: unknown[][] } },
  partial: Record<string, unknown>
) => {
  const calls = mock.mock.calls;
  const hasMatchingCall = calls.some((call: unknown[]) =>
    Object.keys(partial).every(
      (key) => (call[0] as Record<string, unknown>)[key] === partial[key]
    )
  );
  // This function should return boolean for assertion
  return hasMatchingCall;
};
