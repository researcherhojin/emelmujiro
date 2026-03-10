import React from 'react';

// Mock HelmetProvider
export const HelmetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Mock Helmet
export const Helmet: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Default export
const mockHelmet = {
  Helmet,
  HelmetProvider,
};

export default mockHelmet;
