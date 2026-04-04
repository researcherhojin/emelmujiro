import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import PrivacyPolicyPage from '../PrivacyPolicyPage';

describe('PrivacyPolicyPage', () => {
  const renderPage = () => renderWithProviders(<PrivacyPolicyPage />);

  it('renders page title and subtitle', () => {
    renderPage();
    expect(screen.getByText('privacy.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.subtitle')).toBeInTheDocument();
  });

  it('renders section label', () => {
    renderPage();
    expect(screen.getByText('privacy.sectionLabel')).toBeInTheDocument();
  });

  it('renders last updated date', () => {
    renderPage();
    expect(screen.getByText(/privacy\.lastUpdated/)).toBeInTheDocument();
    expect(screen.getByText(/2026-04-05/)).toBeInTheDocument();
  });

  it('renders all 10 section titles', () => {
    renderPage();
    const sections = [
      'overview',
      'dataCollection',
      'usage',
      'sharing',
      'cookies',
      'retention',
      'rights',
      'children',
      'changes',
      'contact',
    ];
    sections.forEach((section, idx) => {
      expect(screen.getByText(`${idx + 1}. privacy.${section}.title`)).toBeInTheDocument();
    });
  });

  it('renders all 10 section contents', () => {
    renderPage();
    const sections = [
      'overview',
      'dataCollection',
      'usage',
      'sharing',
      'cookies',
      'retention',
      'rights',
      'children',
      'changes',
      'contact',
    ];
    sections.forEach((section) => {
      expect(screen.getByText(`privacy.${section}.content`)).toBeInTheDocument();
    });
  });

  it('renders articles with correct heading hierarchy', () => {
    renderPage();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('privacy.title');

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s).toHaveLength(10);
  });
});
