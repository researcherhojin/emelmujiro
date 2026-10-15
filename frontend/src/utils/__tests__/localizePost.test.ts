import { describe, it, expect } from 'vitest';
import { isTranslated, localizePost } from '../localizePost';
import type { BlogPost } from '../../types';

const base: BlogPost = {
  id: 1,
  title: '한국어 제목',
  slug: 'post',
  content: '본문',
  content_html: '<p>본문</p>',
  description: '한국어 설명',
  author: 'Author',
  date: '2026-10-16',
  tags: ['양자화'],
};

const translated: BlogPost = {
  ...base,
  title_en: 'English title',
  description_en: 'English description',
  content_html_en: '<p>Body</p>',
  tags_en: ['Quantization'],
  is_translated: true,
};

describe('isTranslated', () => {
  it('is true only with the flag and all three English fields', () => {
    expect(isTranslated(translated)).toBe(true);
  });

  it.each([
    ['a missing flag (API older than the field)', { ...translated, is_translated: undefined }],
    ['a false flag', { ...translated, is_translated: false }],
    ['a blank title', { ...translated, title_en: '  ' }],
    ['a missing description', { ...translated, description_en: undefined }],
    ['an empty body', { ...translated, content_html_en: '' }],
  ])('is false for %s', (_label, post) => {
    expect(isTranslated(post as BlogPost)).toBe(false);
  });

  it('is false for no post', () => {
    expect(isTranslated(null)).toBe(false);
    expect(isTranslated(undefined)).toBe(false);
  });
});

describe('localizePost', () => {
  it('swaps in the English fields on an English route', () => {
    const post = localizePost(translated, 'en');
    expect(post.title).toBe('English title');
    expect(post.description).toBe('English description');
    expect(post.content_html).toBe('<p>Body</p>');
    expect(post.tags).toEqual(['Quantization']);
    expect(post.slug).toBe('post');
  });

  it('keeps the Korean tags when no English tags are set', () => {
    expect(localizePost({ ...translated, tags_en: [] }, 'en').tags).toEqual(['양자화']);
    expect(localizePost({ ...translated, tags_en: undefined }, 'en').tags).toEqual(['양자화']);
  });

  it('returns the original on a Korean route', () => {
    expect(localizePost(translated, 'ko')).toBe(translated);
  });

  it('returns the original for an untranslated post on an English route', () => {
    expect(localizePost(base, 'en')).toBe(base);
  });

  it('returns the original when the language is unknown', () => {
    expect(localizePost(translated, undefined)).toBe(translated);
  });
});
