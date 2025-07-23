import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('HeroSection Component', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  test('renders main heading', () => {
    renderWithRouter(<HeroSection />);
    
    expect(screen.getByText('AI 기술의 대중화를')).toBeInTheDocument();
    expect(screen.getByText('선도하는 전문 기업')).toBeInTheDocument();
  });

  test('renders subheading', () => {
    renderWithRouter(<HeroSection />);
    
    expect(screen.getByText(/2022년부터 축적한 AI 교육 노하우/)).toBeInTheDocument();
  });

  test('renders call to action buttons', () => {
    renderWithRouter(<HeroSection />);
    
    expect(screen.getByRole('button', { name: '프로젝트 문의하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '회사 소개 보기' })).toBeInTheDocument();
  });
});