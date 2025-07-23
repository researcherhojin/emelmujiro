import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

describe('Footer Component', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  test('renders company name', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('에멜무지로')).toBeInTheDocument();
  });

  test('renders tagline', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('AI 기술의 대중화를 선도하는 전문 기업')).toBeInTheDocument();
  });

  test('renders contact information', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('연락처')).toBeInTheDocument();
    expect(screen.getByText('researcherhojin@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('010-7279-0380')).toBeInTheDocument();
  });

  test('renders quick links', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('빠른 링크')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '회사소개' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '서비스' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '대표 프로필' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '문의하기' })).toBeInTheDocument();
  });

  test('renders copyright text', () => {
    renderWithRouter(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} 에멜무지로. All rights reserved.`)).toBeInTheDocument();
  });

  test('contact links have correct attributes', () => {
    renderWithRouter(<Footer />);
    
    const emailLink = screen.getByRole('link', { name: 'researcherhojin@gmail.com' });
    expect(emailLink).toHaveAttribute('href', 'mailto:researcherhojin@gmail.com');
    
    const phoneLink = screen.getByRole('link', { name: '010-7279-0380' });
    expect(phoneLink).toHaveAttribute('href', 'tel:010-7279-0380');
  });
});