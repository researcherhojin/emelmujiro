import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BlogProvider } from '../contexts/BlogContext';
import { AuthProvider } from '../contexts/AuthContext';
import { UIProvider } from '../contexts/UIContext';
import { FormProvider } from '../contexts/FormContext';

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

// Custom render function
export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { renderWithProviders as render };

// Additional utility functions for testing contexts
export const renderWithBlogProvider = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BlogProvider>{children}</BlogProvider>
  );
  return render(ui, { wrapper: Wrapper });
};

export const renderWithAuthProvider = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );
  return render(ui, { wrapper: Wrapper });
};

export const renderWithUIProvider = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <UIProvider>{children}</UIProvider>
  );
  return render(ui, { wrapper: Wrapper });
};

export const renderWithFormProvider = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <FormProvider>{children}</FormProvider>
  );
  return render(ui, { wrapper: Wrapper });
};
