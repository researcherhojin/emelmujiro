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

// Custom render function with proper typing
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Additional custom options can be added here if needed
}

export const renderWithProviders = (ui: ReactElement, options?: CustomRenderOptions) => {
  const mergedOptions = { wrapper: AllTheProviders, ...options } as RenderOptions;
  return render(ui, mergedOptions);
};

// Re-export everything
export * from '@testing-library/react';
export { renderWithProviders as render };

// Additional utility functions for testing contexts
export const renderWithBlogProvider = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BlogProvider>{children}</BlogProvider>
  );
  const options = { wrapper: Wrapper } as RenderOptions;
  return render(ui, options);
};

export const renderWithAuthProvider = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );
  const options = { wrapper: Wrapper } as RenderOptions;
  return render(ui, options);
};

export const renderWithUIProvider = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <UIProvider>{children}</UIProvider>
  );
  const options = { wrapper: Wrapper } as RenderOptions;
  return render(ui, options);
};

export const renderWithFormProvider = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <FormProvider>{children}</FormProvider>
  );
  const options = { wrapper: Wrapper } as RenderOptions;
  return render(ui, options);
};
