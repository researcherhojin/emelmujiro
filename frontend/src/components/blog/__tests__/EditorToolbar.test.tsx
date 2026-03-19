import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

import EditorToolbar from '../EditorToolbar';

// Track which methods were called on the chain
const calledMethods: string[] = [];

function createMockEditor() {
  // Create a chainable proxy that records method calls
  const createChain = (): unknown => {
    return new Proxy(
      { run: vi.fn() },
      {
        get(target, prop: string) {
          if (prop === 'run') return target.run;
          return vi.fn((..._args: unknown[]) => {
            calledMethods.push(prop);
            return createChain();
          });
        },
      }
    );
  };

  return {
    chain: vi.fn(() => createChain()),
    isActive: vi.fn().mockReturnValue(false),
    can: vi.fn(
      () =>
        new Proxy(
          {},
          {
            get(_target, prop: string) {
              return vi.fn().mockReturnValue(true);
            },
          }
        )
    ),
  };
}

// Helper: buttons have title attributes, but lucide icons also create <title> elements.
// Use getAllByTitle and filter to the actual <button> elements.
const getToolbarButton = (title: string): HTMLButtonElement => {
  const elements = screen.getAllByTitle(title);
  const button = elements.find((el) => el.tagName === 'BUTTON');
  if (!button) throw new Error(`No button found with title "${title}"`);
  return button as HTMLButtonElement;
};

describe('EditorToolbar', () => {
  const mockOnImageUpload = vi.fn().mockResolvedValue('/media/test.jpg');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockEditor: any;

  beforeEach(() => {
    calledMethods.length = 0;
    mockEditor = createMockEditor();
    vi.clearAllMocks();
  });

  it('renders all toolbar buttons', () => {
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);

    const titles = [
      'Bold',
      'Italic',
      'Underline',
      'Strikethrough',
      'Inline code',
      'Heading 1',
      'Heading 2',
      'Heading 3',
      'Bullet list',
      'Ordered list',
      'Task list',
      'Blockquote',
      'Code block',
      'Horizontal rule',
      'Link',
      'Image',
      'Undo',
      'Redo',
    ];
    for (const title of titles) {
      expect(getToolbarButton(title)).toBeInTheDocument();
    }
  });

  it('calls toggleBold on Bold button click', () => {
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Bold'));
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(calledMethods).toContain('toggleBold');
  });

  it('calls toggleItalic on Italic button click', () => {
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Italic'));
    expect(calledMethods).toContain('toggleItalic');
  });

  it('calls toggleHeading on H1 button click', () => {
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Heading 1'));
    expect(calledMethods).toContain('toggleHeading');
  });

  it('calls toggleBulletList on Bullet list click', () => {
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Bullet list'));
    expect(calledMethods).toContain('toggleBulletList');
  });

  it('calls toggleCodeBlock on Code block click', () => {
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Code block'));
    expect(calledMethods).toContain('toggleCodeBlock');
  });

  it('calls setHorizontalRule on Horizontal rule click', () => {
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Horizontal rule'));
    expect(calledMethods).toContain('setHorizontalRule');
  });

  it('calls undo on Undo button click', () => {
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Undo'));
    expect(calledMethods).toContain('undo');
  });

  it('calls redo on Redo button click', () => {
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Redo'));
    expect(calledMethods).toContain('redo');
  });

  it('highlights active formatting buttons', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'bold');
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    const boldBtn = getToolbarButton('Bold');
    expect(boldBtn.className).toContain('bg-gray-200');
  });

  it('calls unsetLink when link is active', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'link');
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Link'));
    expect(calledMethods).toContain('unsetLink');
  });

  it('prompts for URL when adding a link', () => {
    mockEditor.isActive.mockReturnValue(false);
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('https://example.com');
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Link'));
    expect(promptSpy).toHaveBeenCalledWith('URL을 입력하세요:');
    expect(calledMethods).toContain('setLink');
    promptSpy.mockRestore();
  });

  it('does not add link when prompt is cancelled', () => {
    mockEditor.isActive.mockReturnValue(false);
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    fireEvent.click(getToolbarButton('Link'));
    expect(calledMethods).not.toContain('setLink');
    promptSpy.mockRestore();
  });

  it('disables undo when cannot undo', () => {
    mockEditor.can = vi.fn(
      () =>
        new Proxy(
          {},
          {
            get(_target, prop: string) {
              if (prop === 'undo') return vi.fn().mockReturnValue(false);
              return vi.fn().mockReturnValue(true);
            },
          }
        )
    );
    render(<EditorToolbar editor={mockEditor} onImageUpload={mockOnImageUpload} />);
    expect(getToolbarButton('Undo')).toBeDisabled();
  });
});
