import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import PrivacyPolicyPage from '../PrivacyPolicyPage';

const ALL_SECTIONS = [
  'overview',
  'dataCollection',
  'usage',
  'retention',
  'sharing',
  'delegation',
  'rights',
  'safety',
  'cookies',
  'children',
  'officer',
  'remedies',
  'changes',
];

describe('PrivacyPolicyPage', () => {
  const renderPage = () => renderWithProviders(<PrivacyPolicyPage />);

  it('renders page title and subtitle', () => {
    renderPage();
    expect(screen.getByText('privacy.title')).toBeInTheDocument();
    expect(screen.getByText('privacy.subtitle')).toBeInTheDocument();
  });

  it('renders section label', () => {
    renderPage();
    const labels = screen.getAllByText('privacy.sectionLabel');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders last updated date', () => {
    renderPage();
    expect(screen.getByText(/privacy\.lastUpdated/)).toBeInTheDocument();
    expect(screen.getByText(/2026-04-15/)).toBeInTheDocument();
  });

  it('renders table of contents with all 13 sections', () => {
    renderPage();
    const nav = screen.getByRole('navigation', { name: /table of contents/i });
    expect(nav).toBeInTheDocument();
    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(13);
  });

  it('renders all 13 section titles', () => {
    renderPage();
    ALL_SECTIONS.forEach((section, idx) => {
      const elements = screen.getAllByText(`${idx + 1}. privacy.${section}.title`);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders all 13 section contents', () => {
    renderPage();
    ALL_SECTIONS.forEach((section) => {
      expect(screen.getByText(`privacy.${section}.content`)).toBeInTheDocument();
    });
  });

  it('renders correct heading hierarchy (1 h1, 14 h2s)', () => {
    renderPage();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('privacy.title');

    // 13 content h2s + 1 TOC h2
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s).toHaveLength(14);
  });

  it('renders anchor ids for each section', () => {
    renderPage();
    ALL_SECTIONS.forEach((section) => {
      expect(document.getElementById(`privacy-${section}`)).toBeInTheDocument();
    });
  });
});
