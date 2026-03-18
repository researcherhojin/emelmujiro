import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BlogProvider } from '../contexts/BlogContext';
import { AuthProvider } from '../contexts/AuthContext';
import { UIProvider } from '../contexts/UIContext';
import { FormProvider } from '../contexts/FormContext';
import { NotificationProvider } from '../contexts/NotificationContext';

// Custom render function with all providers (matches App.tsx hierarchy)
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <HelmetProvider>
      <UIProvider>
        <AuthProvider>
          <NotificationProvider>
            <BlogProvider>
              <FormProvider>
                <Router>{children}</Router>
              </FormProvider>
            </BlogProvider>
          </NotificationProvider>
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
