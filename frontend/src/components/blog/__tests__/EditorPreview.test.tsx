import { render, screen } from '@testing-library/react';
import React from 'react';
import EditorPreview from '../EditorPreview';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) =>
    React.createElement('div', { 'data-testid': 'markdown' }, children),
}));

vi.mock('remark-gfm', () => ({
  default: {},
}));

describe('EditorPreview', () => {
  it('renders preview heading', () => {
    render(<EditorPreview title="" excerpt="" content="" category="" tags="" imageUrl="" />);

    expect(screen.getByText('blogEditor.preview')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<EditorPreview title="My Post" excerpt="" content="" category="" tags="" imageUrl="" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Post');
  });

  it('renders fallback title when title is empty', () => {
    render(<EditorPreview title="" excerpt="" content="" category="" tags="" imageUrl="" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('blogEditor.enterTitle');
  });

  it('renders category badge when provided', () => {
    render(<EditorPreview title="Test" excerpt="" content="" category="AI" tags="" imageUrl="" />);

    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('does not render category badge when empty', () => {
    render(<EditorPreview title="Test" excerpt="" content="" category="" tags="" imageUrl="" />);

    expect(screen.queryByText('AI')).not.toBeInTheDocument();
  });

  it('renders tags when provided', () => {
    render(
      <EditorPreview
        title="Test"
        excerpt=""
        content=""
        category=""
        tags="react, typescript"
        imageUrl=""
      />
    );

    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
  });

  it('renders excerpt when provided', () => {
    render(
      <EditorPreview
        title="Test"
        excerpt="This is an excerpt"
        content=""
        category=""
        tags=""
        imageUrl=""
      />
    );

    expect(screen.getByText('This is an excerpt')).toBeInTheDocument();
  });

  it('renders image when imageUrl is provided', () => {
    render(
      <EditorPreview
        title="Test"
        excerpt=""
        content=""
        category=""
        tags=""
        imageUrl="https://example.com/image.jpg"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(img).toHaveAttribute('alt', 'Test');
  });

  it('does not render image when imageUrl is empty', () => {
    render(<EditorPreview title="Test" excerpt="" content="" category="" tags="" imageUrl="" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('passes content to markdown renderer', () => {
    render(
      <EditorPreview
        title="Test"
        excerpt=""
        content="# Hello World"
        category=""
        tags=""
        imageUrl=""
      />
    );

    expect(screen.getByTestId('markdown')).toHaveTextContent('# Hello World');
  });
});
