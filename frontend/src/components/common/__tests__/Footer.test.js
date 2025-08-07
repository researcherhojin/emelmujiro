import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

describe('Footer Component', () => {
  const renderWithRouter = component => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test('renders company name', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('에멜무지로')).toBeInTheDocument();
  });

  test('renders services section', () => {
    renderWithRouter(<Footer />);
    // There are multiple '서비스' texts (header and navigation), so use getAllByText
    const serviceTexts = screen.getAllByText('서비스');
    expect(serviceTexts.length).toBeGreaterThan(0);
    expect(serviceTexts[0]).toBeInTheDocument();

    expect(screen.getByText('AI 솔루션 개발')).toBeInTheDocument();
    expect(screen.getByText('AI 교육 & 강의')).toBeInTheDocument();
  });

  test('renders contact information', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('researcherhojin@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('010-7279-0380')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('메뉴')).toBeInTheDocument();
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getAllByText('대표 프로필')[0]).toBeInTheDocument();
    expect(screen.getAllByText('문의하기')[0]).toBeInTheDocument();
  });

  test('renders copyright text', () => {
    renderWithRouter(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} 에멜무지로. All rights reserved.`)
    ).toBeInTheDocument();
  });

  test('contact information is displayed correctly', () => {
    renderWithRouter(<Footer />);

    // Email and phone are displayed as text, not links in the new Footer
    expect(screen.getByText('researcherhojin@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('010-7279-0380')).toBeInTheDocument();
  });
});
