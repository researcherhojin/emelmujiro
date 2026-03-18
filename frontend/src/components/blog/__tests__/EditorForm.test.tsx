import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import EditorForm from '../EditorForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

const defaultFormData = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  tags: '',
  author: '',
  image_url: '',
};

const categories = ['AI', 'Education', 'Consulting'];

describe('EditorForm', () => {
  const onChange = vi.fn();
  const onSave = vi.fn();
  const onTogglePreview = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
    onSave.mockClear();
    onTogglePreview.mockClear();
  });

  it('renders all form fields', () => {
    render(
      <EditorForm
        formData={defaultFormData}
        categories={categories}
        showPreview={false}
        onChange={onChange}
        onSave={onSave}
        onTogglePreview={onTogglePreview}
      />
    );

    expect(screen.getByText('blogEditor.titleLabel')).toBeInTheDocument();
    expect(screen.getByText('blogEditor.excerptLabel')).toBeInTheDocument();
    expect(screen.getByText('blogEditor.categoryLabel')).toBeInTheDocument();
    expect(screen.getByText('blogEditor.authorLabel')).toBeInTheDocument();
    expect(screen.getByText('blogEditor.tagsLabel')).toBeInTheDocument();
    expect(screen.getByText('blogEditor.imageUrlLabel')).toBeInTheDocument();
    expect(screen.getByText('blogEditor.contentLabel')).toBeInTheDocument();
  });

  it('renders category options', () => {
    render(
      <EditorForm
        formData={defaultFormData}
        categories={categories}
        showPreview={false}
        onChange={onChange}
        onSave={onSave}
        onTogglePreview={onTogglePreview}
      />
    );

    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Consulting')).toBeInTheDocument();
  });

  it('calls onChange when input values change', () => {
    render(
      <EditorForm
        formData={defaultFormData}
        categories={categories}
        showPreview={false}
        onChange={onChange}
        onSave={onSave}
        onTogglePreview={onTogglePreview}
      />
    );

    const titleInput = screen.getByPlaceholderText('blogEditor.enterTitle');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when save button is clicked', () => {
    render(
      <EditorForm
        formData={defaultFormData}
        categories={categories}
        showPreview={false}
        onChange={onChange}
        onSave={onSave}
        onTogglePreview={onTogglePreview}
      />
    );

    fireEvent.click(screen.getByText('common.save'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows "editor" text on preview button when showPreview is true', () => {
    render(
      <EditorForm
        formData={defaultFormData}
        categories={categories}
        showPreview={true}
        onChange={onChange}
        onSave={onSave}
        onTogglePreview={onTogglePreview}
      />
    );

    const buttons = screen.getAllByRole('button');
    const previewButton = buttons.find((b) => b.textContent?.includes('blogEditor.editor'));
    expect(previewButton).toBeDefined();
  });

  it('shows "preview" text on preview button when showPreview is false', () => {
    render(
      <EditorForm
        formData={defaultFormData}
        categories={categories}
        showPreview={false}
        onChange={onChange}
        onSave={onSave}
        onTogglePreview={onTogglePreview}
      />
    );

    const buttons = screen.getAllByRole('button');
    const previewButton = buttons.find((b) => b.textContent?.includes('blogEditor.preview'));
    expect(previewButton).toBeDefined();
  });

  it('calls onTogglePreview when preview button is clicked', () => {
    render(
      <EditorForm
        formData={defaultFormData}
        categories={categories}
        showPreview={false}
        onChange={onChange}
        onSave={onSave}
        onTogglePreview={onTogglePreview}
      />
    );

    fireEvent.click(screen.getByText('blogEditor.preview'));
    expect(onTogglePreview).toHaveBeenCalledTimes(1);
  });

  it('displays form data values in inputs', () => {
    const formData = {
      ...defaultFormData,
      title: 'Test Title',
      author: 'Test Author',
    };

    render(
      <EditorForm
        formData={formData}
        categories={categories}
        showPreview={false}
        onChange={onChange}
        onSave={onSave}
        onTogglePreview={onTogglePreview}
      />
    );

    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Author')).toBeInTheDocument();
  });
});
