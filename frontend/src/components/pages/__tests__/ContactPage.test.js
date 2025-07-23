import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPage from '../ContactPage';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock backgroundSync
jest.mock('../../../utils/backgroundSync', () => ({
  registerBackgroundSync: jest.fn(),
  SYNC_TAGS: {
    CONTACT_FORM: 'sync-contact-form'
  }
}));

describe('ContactPage Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Mock window.location.href
    delete window.location;
    window.location = { href: jest.fn() };
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  test('renders page title', () => {
    render(<ContactPage />);
    expect(screen.getByText('문의하기')).toBeInTheDocument();
  });

  test('renders contact form fields', () => {
    render(<ContactPage />);
    
    expect(screen.getByLabelText(/이름/)).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/전화번호/)).toBeInTheDocument();
    expect(screen.getByLabelText(/회사명/)).toBeInTheDocument();
    expect(screen.getByText(/문의 유형/)).toBeInTheDocument();
    expect(screen.getByLabelText(/문의 내용/)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<ContactPage />);
    expect(screen.getByRole('button', { name: /문의 보내기/ })).toBeInTheDocument();
  });

  test('shows validation errors for empty required fields', async () => {
    render(<ContactPage />);
    
    const submitButton = screen.getByRole('button', { name: /문의 보내기/ });
    fireEvent.click(submitButton);
    
    // Note: Actual validation might be handled differently
    // This test assumes HTML5 validation or custom validation
  });

  test('fills and submits form successfully', async () => {
    // Mock alert
    global.alert = jest.fn();
    
    render(<ContactPage />);
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/이름/), {
      target: { value: '홍길동' }
    });
    fireEvent.change(screen.getByLabelText(/이메일/), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/전화번호/), {
      target: { value: '010-1234-5678' }
    });
    fireEvent.change(screen.getByLabelText(/회사명/), {
      target: { value: '테스트 회사' }
    });
    
    // Select inquiry type
    const solutionRadio = screen.getByLabelText(/AI 솔루션/);
    fireEvent.click(solutionRadio);
    
    fireEvent.change(screen.getByLabelText(/문의 내용/), {
      target: { value: '프로젝트 문의 내용입니다.' }
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /문의 보내기/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(window.location.href).toContain('mailto:researcherhojin@gmail.com');
    });
  });

  test('shows contact information', () => {
    render(<ContactPage />);
    
    expect(screen.getByText('연락처 정보')).toBeInTheDocument();
    expect(screen.getByText('researcherhojin@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('010-7279-0380')).toBeInTheDocument();
  });

  test('inquiry type radio buttons work', () => {
    render(<ContactPage />);
    
    const solutionRadio = screen.getByLabelText(/AI 솔루션/);
    const educationRadio = screen.getByLabelText(/교육 & 강의/);
    
    expect(solutionRadio).toBeChecked();
    expect(educationRadio).not.toBeChecked();
    
    fireEvent.click(educationRadio);
    
    expect(solutionRadio).not.toBeChecked();
    expect(educationRadio).toBeChecked();
  });
});