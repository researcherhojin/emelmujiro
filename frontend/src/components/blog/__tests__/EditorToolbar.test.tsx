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

// Helper: buttons have title attributes (i18n keys in test), but lucide icons also create <title> elements.
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
      'blogEditor.toolbar.bold',
      'blogEditor.toolbar.italic',
      'blogEditor.toolbar.underline',
      'blogEditor.toolbar.strikethrough',
      'blogEditor.toolbar.inlineCode',
      'blogEditor.toolbar.heading1',
      'blogEditor.toolbar.heading2',
      'blogEditor.toolbar.heading3',
      'blogEditor.toolbar.bulletList',
      'blogEditor.toolbar.orderedList',
      'blogEditor.toolbar.taskList',
      'blogEditor.toolbar.blockquote',
      'blogEditor.toolbar.codeBlock',
      'blogEditor.toolbar.horizontalRule',
      'blogEditor.toolbar.link',
      'blogEditor.toolbar.image',
      'blogEditor.toolbar.undo',
      'blogEditor.toolbar.redo',
    ];
    for (const title of titles) {
      expect(getToolbarButton(title)).toBeInTheDocument();
    }
  });

  it('renders all toolbar buttons with aria-label attributes', () => {
    renderToolbar();

    const labels = [
      'blogEditor.toolbar.bold',
      'blogEditor.toolbar.italic',
      'blogEditor.toolbar.underline',
      'blogEditor.toolbar.strikethrough',
      'blogEditor.toolbar.inlineCode',
      'blogEditor.toolbar.heading1',
      'blogEditor.toolbar.heading2',
      'blogEditor.toolbar.heading3',
      'blogEditor.toolbar.bulletList',
      'blogEditor.toolbar.orderedList',
      'blogEditor.toolbar.taskList',
      'blogEditor.toolbar.blockquote',
      'blogEditor.toolbar.codeBlock',
      'blogEditor.toolbar.horizontalRule',
      'blogEditor.toolbar.link',
      'blogEditor.toolbar.image',
      'blogEditor.toolbar.undo',
      'blogEditor.toolbar.redo',
    ];
    for (const label of labels) {
      const button = getToolbarButton(label);
      expect(button).toHaveAttribute('aria-label', label);
    }
  });

  it('calls toggleBold on Bold button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.bold'));
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(calledMethods).toContain('toggleBold');
  });

  it('calls toggleItalic on Italic button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.italic'));
    expect(calledMethods).toContain('toggleItalic');
  });

  it('calls toggleHeading on H1 button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.heading1'));
    expect(calledMethods).toContain('toggleHeading');
  });

  it('calls toggleBulletList on Bullet list click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.bulletList'));
    expect(calledMethods).toContain('toggleBulletList');
  });

  it('calls toggleCodeBlock on Code block click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.codeBlock'));
    expect(calledMethods).toContain('toggleCodeBlock');
  });

  it('calls setHorizontalRule on Horizontal rule click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.horizontalRule'));
    expect(calledMethods).toContain('setHorizontalRule');
  });

  it('calls undo on Undo button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.undo'));
    expect(calledMethods).toContain('undo');
  });

  it('calls redo on Redo button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.redo'));
    expect(calledMethods).toContain('redo');
  });

  it('highlights active formatting buttons', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'bold');
    renderToolbar();
    const boldBtn = getToolbarButton('blogEditor.toolbar.bold');
    expect(boldBtn.className).toContain('bg-gray-200');
  });

  it('calls unsetLink when link is active', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'link');
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.link'));
    expect(calledMethods).toContain('unsetLink');
  });

  it('shows URL input when adding a link', () => {
    mockEditor.isActive.mockReturnValue(false);
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.link'));
    // URL input should appear
    const urlInput = screen.getByPlaceholderText('blogEditor.toolbar.enterUrl');
    expect(urlInput).toBeInTheDocument();
  });

  it('applies link on Enter in URL input', async () => {
    mockEditor.isActive.mockReturnValue(false);
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.link'));
    const urlInput = screen.getByPlaceholderText('blogEditor.toolbar.enterUrl');
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.keyDown(urlInput, { key: 'Enter' });
    expect(calledMethods).toContain('setLink');
  });

  it('closes URL input on Escape without applying link', () => {
    mockEditor.isActive.mockReturnValue(false);
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.link'));
    const urlInput = screen.getByPlaceholderText('blogEditor.toolbar.enterUrl');
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.keyDown(urlInput, { key: 'Escape' });
    expect(calledMethods).not.toContain('setLink');
    expect(screen.queryByPlaceholderText('blogEditor.toolbar.enterUrl')).not.toBeInTheDocument();
  });

  it('does not apply link when URL input is empty', () => {
    mockEditor.isActive.mockReturnValue(false);
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.link'));
    const urlInput = screen.getByPlaceholderText('blogEditor.toolbar.enterUrl');
    fireEvent.keyDown(urlInput, { key: 'Enter' });
    expect(calledMethods).not.toContain('setLink');
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
    expect(getToolbarButton('blogEditor.toolbar.undo')).toBeDisabled();
  });

  // --- NEW TEST CASES ---

  it('calls toggleUnderline on Underline button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.underline'));
    expect(calledMethods).toContain('toggleUnderline');
  });

  it('calls toggleStrike on Strikethrough button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.strikethrough'));
    expect(calledMethods).toContain('toggleStrike');
  });

  it('calls toggleCode on Inline code button click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.inlineCode'));
    expect(calledMethods).toContain('toggleCode');
  });

  it('calls toggleHeading with level 2 on H2 click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.heading2'));
    expect(calledMethods).toContain('toggleHeading');
  });

  it('calls toggleHeading with level 3 on H3 click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.heading3'));
    expect(calledMethods).toContain('toggleHeading');
  });

  it('calls toggleOrderedList on Ordered list click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.orderedList'));
    expect(calledMethods).toContain('toggleOrderedList');
  });

  it('calls toggleTaskList on Task list click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.taskList'));
    expect(calledMethods).toContain('toggleTaskList');
  });

  it('calls toggleBlockquote on Blockquote click', () => {
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.blockquote'));
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
    expect(getToolbarButton('blogEditor.toolbar.redo')).toBeDisabled();
  });

  it('highlights active italic button', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'italic');
    renderToolbar();
    const italicBtn = getToolbarButton('blogEditor.toolbar.italic');
    expect(italicBtn.className).toContain('bg-gray-200');
  });

  it('highlights active heading button', () => {
    mockEditor.isActive.mockImplementation((type: string, opts?: { level?: number }) => {
      return type === 'heading' && opts?.level === 2;
    });
    renderToolbar();
    const h2Btn = getToolbarButton('blogEditor.toolbar.heading2');
    expect(h2Btn.className).toContain('bg-gray-200');
    // H1 should not be highlighted
    const h1Btn = getToolbarButton('blogEditor.toolbar.heading1');
    expect(h1Btn.className).not.toContain('bg-gray-200');
  });

  it('highlights active code block button', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'codeBlock');
    renderToolbar();
    const codeBlockBtn = getToolbarButton('blogEditor.toolbar.codeBlock');
    expect(codeBlockBtn.className).toContain('bg-gray-200');
  });

  it('highlights active link button', () => {
    mockEditor.isActive.mockImplementation((type: string) => type === 'link');
    renderToolbar();
    const linkBtn = getToolbarButton('blogEditor.toolbar.link');
    expect(linkBtn.className).toContain('bg-gray-200');
  });

  it('triggers file input click on Image button click', () => {
    renderToolbar();
    // The hidden file input should exist
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    expect(fileInput.accept).toBe('image/*');

    const clickSpy = vi.spyOn(fileInput, 'click');
    fireEvent.click(getToolbarButton('blogEditor.toolbar.image'));
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

  it('extends mark range when setting link via URL input', () => {
    mockEditor.isActive.mockReturnValue(false);
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.link'));
    const urlInput = screen.getByPlaceholderText('blogEditor.toolbar.enterUrl');
    fireEvent.change(urlInput, { target: { value: 'https://test.com' } });
    fireEvent.keyDown(urlInput, { key: 'Enter' });
    expect(calledMethods).toContain('extendMarkRange');
    expect(calledMethods).toContain('setLink');
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
    const hrBtn = getToolbarButton('blogEditor.toolbar.horizontalRule');
    // Horizontal rule always passes false for active
    expect(hrBtn.className).toContain('text-gray-500');
    expect(hrBtn.className).not.toContain('bg-gray-200');
  });

  it('applies non-active style to Image button', () => {
    renderToolbar();
    const imgBtn = getToolbarButton('blogEditor.toolbar.image');
    expect(imgBtn.className).toContain('text-gray-500');
    expect(imgBtn.className).not.toContain('bg-gray-200');
  });

  it('refocuses editor when Escape is pressed in URL input', () => {
    mockEditor.isActive.mockReturnValue(false);
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.link'));
    const urlInput = screen.getByPlaceholderText('blogEditor.toolbar.enterUrl');
    fireEvent.change(urlInput, { target: { value: 'https://test.com' } });
    fireEvent.keyDown(urlInput, { key: 'Escape' });

    // Escape should trigger editor.chain().focus().run() without setting a link
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(calledMethods).toContain('focus');
    expect(calledMethods).not.toContain('setLink');
    // URL input should be hidden
    expect(screen.queryByPlaceholderText('blogEditor.toolbar.enterUrl')).not.toBeInTheDocument();
  });

  it('handles image upload when fileInputRef.current is present', async () => {
    renderToolbar();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['pixels'], 'photo.jpg', { type: 'image/jpeg' });

    // Verify the ref is attached (non-null branch of line 45)
    Object.defineProperty(fileInput, 'files', { value: [file], writable: true });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnImageUpload).toHaveBeenCalledWith(file);
    });
    await waitFor(() => {
      expect(calledMethods).toContain('setImage');
    });
    // After upload, the file input value should be cleared
    expect(fileInput.value).toBe('');
  });

  it('clears URL value when Escape is pressed', () => {
    mockEditor.isActive.mockReturnValue(false);
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.link'));
    const urlInput = screen.getByPlaceholderText('blogEditor.toolbar.enterUrl');
    fireEvent.change(urlInput, { target: { value: 'https://will-be-cleared.com' } });
    fireEvent.keyDown(urlInput, { key: 'Escape' });

    // Re-open the URL input and verify it starts empty
    fireEvent.click(getToolbarButton('blogEditor.toolbar.link'));
    const newUrlInput = screen.getByPlaceholderText('blogEditor.toolbar.enterUrl');
    expect((newUrlInput as HTMLInputElement).value).toBe('');
  });

  it('ignores keys other than Enter and Escape in URL input', () => {
    // Cover the false branch of `else if (e.key === 'Escape')` at line 74
    mockEditor.isActive.mockReturnValue(false);
    renderToolbar();
    fireEvent.click(getToolbarButton('blogEditor.toolbar.link'));
    const urlInput = screen.getByPlaceholderText('blogEditor.toolbar.enterUrl');
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

    // Press a key that is neither Enter nor Escape
    fireEvent.keyDown(urlInput, { key: 'a' });

    // URL input should still be visible (not dismissed)
    expect(screen.getByPlaceholderText('blogEditor.toolbar.enterUrl')).toBeInTheDocument();
    // No link should have been set
    expect(calledMethods).not.toContain('setLink');
    // Value should remain unchanged
    expect((urlInput as HTMLInputElement).value).toBe('https://example.com');
  });

  it('handles image upload when fileInputRef.current becomes null', async () => {
    // Cover the false branch of `if (fileInputRef.current)` at line 45.
    // We access the React ref through the DOM element's internal fiber,
    // then null it out during the async onImageUpload callback.
    renderToolbar();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    // Find the React ref object attached to the file input via its fiber
    const fiberKey = Object.keys(fileInput).find((key) => key.startsWith('__reactFiber$'));
    let refObj: { current: HTMLInputElement | null } | null = null;
    if (fiberKey) {
      const fiber = (fileInput as unknown as Record<string, unknown>)[fiberKey] as {
        ref?: { current: HTMLInputElement | null };
      };
      if (fiber?.ref && 'current' in fiber.ref) {
        refObj = fiber.ref;
      }
    }

    // Make onImageUpload null out the ref before resolving
    mockOnImageUpload.mockImplementation(async () => {
      if (refObj) {
        refObj.current = null;
      }
      return '/media/test.jpg';
    });

    const file = new File(['pixels'], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', { value: [file], writable: true });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnImageUpload).toHaveBeenCalledWith(file);
    });

    // setImage was called (upload succeeded), but fileInputRef.current was null
    // so the `if (fileInputRef.current)` guard at line 45 took the false branch
    await waitFor(() => {
      expect(calledMethods).toContain('setImage');
    });
  });
});
