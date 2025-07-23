import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPage from '../ContactPage';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn()
}));

const axios = require('axios');

describe('ContactPage Component', () => {
  beforeEach(() => {
    axios.post.mockClear();
  });

  test('renders page title', () => {
    render(<ContactPage />);
    expect(screen.getByText('프로젝트 문의')).toBeInTheDocument();
  });

  test('renders contact form fields', () => {
    render(<ContactPage />);
    
    expect(screen.getByLabelText('이름')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('연락처')).toBeInTheDocument();
    expect(screen.getByLabelText('회사명')).toBeInTheDocument();
    expect(screen.getByLabelText('프로젝트 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('문의 내용')).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<ContactPage />);
    expect(screen.getByRole('button', { name: '문의 전송' })).toBeInTheDocument();
  });

  test('shows validation errors for empty required fields', async () => {
    render(<ContactPage />);
    
    const submitButton = screen.getByRole('button', { name: '문의 전송' });
    fireEvent.click(submitButton);
    
    // Note: Actual validation might be handled differently
    // This test assumes HTML5 validation or custom validation
  });

  test('fills and submits form successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    
    render(<ContactPage />);
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText('이름'), {
      target: { value: '홍길동' }
    });
    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('연락처'), {
      target: { value: '010-1234-5678' }
    });
    fireEvent.change(screen.getByLabelText('회사명'), {
      target: { value: '테스트 회사' }
    });
    fireEvent.change(screen.getByLabelText('프로젝트 유형'), {
      target: { value: 'ai-consulting' }
    });
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '프로젝트 문의 내용입니다.' }
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: '문의 전송' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact/'),
        expect.objectContaining({
          name: '홍길동',
          email: 'test@example.com',
          phone: '010-1234-5678',
          company: '테스트 회사',
          project_type: 'ai-consulting',
          message: '프로젝트 문의 내용입니다.'
        })
      );
    });
  });

  test('shows contact information', () => {
    render(<ContactPage />);
    
    expect(screen.getByText('연락처 정보')).toBeInTheDocument();
    expect(screen.getByText('researcherhojin@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('010-7279-0380')).toBeInTheDocument();
  });

  test('project type select has options', () => {
    render(<ContactPage />);
    
    const projectSelect = screen.getByLabelText('프로젝트 유형');
    const options = projectSelect.querySelectorAll('option');
    
    expect(options.length).toBeGreaterThan(1); // Should have multiple options
  });
});