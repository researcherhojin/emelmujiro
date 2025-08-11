import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions, RenderResult } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BlogProvider } from '../contexts/BlogContext';
import { AuthProvider } from '../contexts/AuthContext';
import { UIProvider } from '../contexts/UIContext';
import { FormProvider } from '../contexts/FormContext';
// ChatProvider is disabled in test environment
// ChatProvider has complex dependencies (WebSocket, timers) that cause issues in tests
// Tests that specifically need ChatProvider should import it directly

// Custom render function with all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <HelmetProvider>
      <UIProvider>
        <AuthProvider>
          <BlogProvider>
            <FormProvider>
              <Router>{children}</Router>
            </FormProvider>
          </BlogProvider>
        </AuthProvider>
      </UIProvider>
    </HelmetProvider>
  );
};

// Custom render function that wraps components with providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>
): RenderResult => {
  return rtlRender(<AllTheProviders>{ui}</AllTheProviders>, options);
};

// Re-export everything
export * from '@testing-library/react';
export { renderWithProviders as render };

// Additional utility functions for testing contexts
export const renderWithBlogProvider = (ui: ReactElement): RenderResult => {
  return rtlRender(<BlogProvider>{ui}</BlogProvider>);
};

export const renderWithAuthProvider = (ui: ReactElement): RenderResult => {
  return rtlRender(<AuthProvider>{ui}</AuthProvider>);
};

export const renderWithUIProvider = (ui: ReactElement): RenderResult => {
  return rtlRender(<UIProvider>{ui}</UIProvider>);
};

export const renderWithFormProvider = (ui: ReactElement): RenderResult => {
  return rtlRender(<FormProvider>{ui}</FormProvider>);
};

export const renderWithRouter = (ui: ReactElement): RenderResult => {
  return rtlRender(<Router>{ui}</Router>);
};
