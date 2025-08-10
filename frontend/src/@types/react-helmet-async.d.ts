declare module 'react-helmet-async' {
  import * as React from 'react';

  export interface HelmetProviderProps {
    children?: React.ReactNode;
    context?: unknown;
  }

  export const HelmetProvider: React.FC<HelmetProviderProps>;

  export interface HelmetProps {
    children?: React.ReactNode;
    [key: string]: unknown;
  }

  export const Helmet: React.FC<HelmetProps>;

  export function useHelmet(): unknown;
}
