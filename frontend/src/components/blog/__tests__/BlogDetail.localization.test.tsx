import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import type { BlogPost } from '../../../types';

// The route language and the props SEOHelmet receives are what this file
// asserts, so both are captured in mutable module state.
const state = vi.hoisted(() => ({
  lang: 'ko',
  post: null as unknown,
  seo: null as null | Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: state.lang, changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children?: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));
vi.mock('../../common/SEOHelmet', () => ({
  default: (props: Record<string, unknown>) => {
    state.seo = props;
    return null;
  },
}));
vi.mock('../../common/StructuredData', () => ({ default: () => null }));
vi.mock('../BlogInteractions', () => ({ default: () => null }));
vi.mock('../BlogComments', () => ({ default: () => null }));
vi.mock('../../../utils/analytics', () => ({ trackBlogView: vi.fn() }));
vi.mock('../../../contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../../../services/api', () => ({ api: {} }));
vi.mock('../../../contexts/BlogContext', () => ({
  useBlog: () => ({
    currentPost: state.post,
    loading: false,
    error: null,
    notFound: false,
    fetchPostById: vi.fn(),
    clearCurrentPost: vi.fn(),
  }),
}));

import BlogDetail from '../BlogDetail';

const korean: BlogPost = {
  id: 1,
  title: '한국어 제목',
  slug: 'post',
  content: '',
  content_html: '<p>한국어 본문</p>',
  description: '한국어 설명',
  author: 'Author',
  date: '2026-10-16',
};
const translated: BlogPost = {
  ...korean,
  title_en: 'English title',
  description_en: 'English description',
  content_html_en: '<p>English body</p>',
  is_translated: true,
};

const renderAt = (lang: string, post: BlogPost) => {
  state.lang = lang;
  state.post = post;
  render(
    <MemoryRouter>
      <BlogDetail />
    </MemoryRouter>
  );
};

describe('BlogDetail language versions', () => {
  beforeEach(() => {
    state.seo = null;
  });

  test('a translated post on /en renders English and declares an English version', () => {
    renderAt('en', translated);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('English title');
    expect(screen.getByText('English body')).toBeInTheDocument();
    expect(state.seo).toMatchObject({
      translated: true,
      lang: 'en',
      description: 'English description',
    });
  });

  test('a translated post on / renders Korean and still declares both versions', () => {
    renderAt('ko', translated);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('한국어 제목');
    expect(state.seo).toMatchObject({ translated: true, lang: 'ko' });
  });

  test('an untranslated post on /en renders Korean and canonicalizes to Korean', () => {
    renderAt('en', korean);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('한국어 제목');
    expect(screen.getByText('한국어 본문')).toBeInTheDocument();
    expect(state.seo).toMatchObject({ translated: false, lang: 'ko' });
  });

  test('the date reads in English on /en and in Korean on /', () => {
    renderAt('en', korean);
    expect(screen.getByText('October 16, 2026')).toBeInTheDocument();
    expect(screen.queryByText('2026년 10월 16일')).not.toBeInTheDocument();
    cleanup();
    renderAt('ko', translated);
    expect(screen.getByText('2026년 10월 16일')).toBeInTheDocument();
  });

  test('a post from an API without is_translated is treated as untranslated', () => {
    renderAt('en', { ...translated, is_translated: undefined });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('한국어 제목');
    expect(state.seo).toMatchObject({ translated: false, lang: 'ko' });
  });
});
