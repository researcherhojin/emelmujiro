import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import type { Editor } from '@tiptap/react';
import EditorToolbar from '../EditorToolbar';

// Track which methods were called on the chain
const calledMethods: string[] = [];
const calledArgs: Record<string, unknown[]> = {};

function createMockEditor() {
  // Create a chainable proxy that records method calls
  const createChain = (): unknown => {
    return new Proxy(
      { run: vi.fn() },
      {
        get(target, prop: string) {
          if (prop === 'run') return target.run;
          return vi.fn((...args: unknown[]) => {
            calledMethods.push(prop);
            calledArgs[prop] = args;
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
  let mockEditor: ReturnType<typeof createMockEditor>;

  const renderToolbar = () =>
    render(
      <EditorToolbar editor={mockEditor as unknown as Editor} onImageUpload={mockOnImageUpload} />
    );

  beforeEach(() => {
    calledMethods.length = 0;
    Object.keys(calledArgs).forEach((key) => delete calledArgs[key]);
    mockEditor = createMockEditor();
    vi.clearAllMocks();
    mockOnImageUpload.mockResolvedValue('/media/test.jpg');
  });

  it('renders all toolbar buttons', () => {
    renderToolbar();

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
    renderToolbar();
    fireEvent.click(getToolbarButton('Bold'));
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(calledMethods).toContain('toggleBold');
  });

  it('calls toggleItalic on Italic button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Italic'));
    expect(calledMethods).toContain('toggleItalic');
  });

  it('calls toggleHeading on H1 button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Heading 1'));
    expect(calledMethods).toContain('toggleHeading');
  });

  it('calls toggleBulletList on Bullet list click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Bullet list'));
    expect(calledMethods).toContain('toggleBulletList');
  });

  it('calls toggleCodeBlock on Code block click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Code block'));
    expect(calledMethods).toContain('toggleCodeBlock');
  });

  it('calls setHorizontalRule on Horizontal rule click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Horizontal rule'));
    expect(calledMethods).toContain('setHorizontalRule');
  });

  it('calls undo on Undo button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Undo'));
    expect(calledMethods).toContain('undo');
  });

  it('calls redo on Redo button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Redo'));
    expect(calledMethods).toContain('redo');
  });

  it('highlights active formatting buttons', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'bold');
    renderToolbar();
    const boldBtn = getToolbarButton('Bold');
    expect(boldBtn.className).toContain('bg-gray-200');
  });

  it('calls unsetLink when link is active', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'link');
    renderToolbar();
    fireEvent.click(getToolbarButton('Link'));
    expect(calledMethods).toContain('unsetLink');
  });

  it('prompts for URL when adding a link', () => {
    mockEditor.isActive.mockReturnValue(false);
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('https://example.com');
    renderToolbar();
    fireEvent.click(getToolbarButton('Link'));
    expect(promptSpy).toHaveBeenCalledWith('blogEditor.enterUrl');
    expect(calledMethods).toContain('setLink');
    promptSpy.mockRestore();
  });

  it('does not add link when prompt is cancelled', () => {
    mockEditor.isActive.mockReturnValue(false);
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);
    renderToolbar();
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
    renderToolbar();
    expect(getToolbarButton('Undo')).toBeDisabled();
  });

  // --- NEW TEST CASES ---

  it('calls toggleUnderline on Underline button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Underline'));
    expect(calledMethods).toContain('toggleUnderline');
  });

  it('calls toggleStrike on Strikethrough button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Strikethrough'));
    expect(calledMethods).toContain('toggleStrike');
  });

  it('calls toggleCode on Inline code button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Inline code'));
    expect(calledMethods).toContain('toggleCode');
  });

  it('calls toggleHeading with level 2 on H2 click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Heading 2'));
    expect(calledMethods).toContain('toggleHeading');
  });

  it('calls toggleHeading with level 3 on H3 click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Heading 3'));
    expect(calledMethods).toContain('toggleHeading');
  });

  it('calls toggleOrderedList on Ordered list click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Ordered list'));
    expect(calledMethods).toContain('toggleOrderedList');
  });

  it('calls toggleTaskList on Task list click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Task list'));
    expect(calledMethods).toContain('toggleTaskList');
  });

  it('calls toggleBlockquote on Blockquote click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('Blockquote'));
    expect(calledMethods).toContain('toggleBlockquote');
  });

  it('disables redo when cannot redo', () => {
    mockEditor.can = vi.fn(
      () =>
        new Proxy(
          {},
          {
            get(_target, prop: string) {
              if (prop === 'redo') return vi.fn().mockReturnValue(false);
              return vi.fn().mockReturnValue(true);
            },
          }
        )
    );
    renderToolbar();
    expect(getToolbarButton('Redo')).toBeDisabled();
  });

  it('highlights active italic button', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'italic');
    renderToolbar();
    const italicBtn = getToolbarButton('Italic');
    expect(italicBtn.className).toContain('bg-gray-200');
  });

  it('highlights active heading button', () => {
    mockEditor.isActive.mockImplementation((type: string, opts?: { level?: number }) => {
      return type === 'heading' && opts?.level === 2;
    });
    renderToolbar();
    const h2Btn = getToolbarButton('Heading 2');
    expect(h2Btn.className).toContain('bg-gray-200');
    // H1 should not be highlighted
    const h1Btn = getToolbarButton('Heading 1');
    expect(h1Btn.className).not.toContain('bg-gray-200');
  });

  it('highlights active code block button', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'codeBlock');
    renderToolbar();
    const codeBlockBtn = getToolbarButton('Code block');
    expect(codeBlockBtn.className).toContain('bg-gray-200');
  });

  it('highlights active link button', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'link');
    renderToolbar();
    const linkBtn = getToolbarButton('Link');
    expect(linkBtn.className).toContain('bg-gray-200');
  });

  it('triggers file input click on Image button click', () => {
    renderToolbar();
    // The hidden file input should exist
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    expect(fileInput.accept).toBe('image/*');

    const clickSpy = vi.spyOn(fileInput, 'click');
    fireEvent.click(getToolbarButton('Image'));
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('handles image upload when file is selected', async () => {
    renderToolbar();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file], writable: true });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnImageUpload).toHaveBeenCalledWith(file);
    });

    // Should call editor.chain().focus().setImage()
    await waitFor(() => {
      expect(calledMethods).toContain('setImage');
    });
  });

  it('does not set image when upload returns null', async () => {
    mockOnImageUpload.mockResolvedValueOnce(null);
    renderToolbar();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file], writable: true });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnImageUpload).toHaveBeenCalledWith(file);
    });

    // setImage should NOT be called
    expect(calledMethods).not.toContain('setImage');
  });

  it('does nothing when no file is selected', async () => {
    renderToolbar();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', { value: [], writable: true });
    fireEvent.change(fileInput);

    expect(mockOnImageUpload).not.toHaveBeenCalled();
  });

  it('resets file input value after image selection', async () => {
    renderToolbar();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file], writable: true });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(fileInput.value).toBe('');
    });
  });

  it('extends mark range when setting link', () => {
    mockEditor.isActive.mockReturnValue(false);
    vi.spyOn(window, 'prompt').mockReturnValue('https://test.com');
    renderToolbar();
    fireEvent.click(getToolbarButton('Link'));
    expect(calledMethods).toContain('extendMarkRange');
    expect(calledMethods).toContain('setLink');
    vi.spyOn(window, 'prompt').mockRestore();
  });

  it('renders hidden file input with image accept type', () => {
    renderToolbar();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    expect(fileInput.accept).toBe('image/*');
    expect(fileInput.className).toContain('hidden');
  });

  it('applies non-active style to Horizontal rule button', () => {
    renderToolbar();
    const hrBtn = getToolbarButton('Horizontal rule');
    // Horizontal rule always passes false for active
    expect(hrBtn.className).toContain('text-gray-500');
    expect(hrBtn.className).not.toContain('bg-gray-200');
  });

  it('applies non-active style to Image button', () => {
    renderToolbar();
    const imgBtn = getToolbarButton('Image');
    expect(imgBtn.className).toContain('text-gray-500');
    expect(imgBtn.className).not.toContain('bg-gray-200');
  });
});
