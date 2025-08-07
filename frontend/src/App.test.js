import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders navbar with company name', () => {
    render(<App />);
    const companyNames = screen.getAllByText('에멜무지로');
    expect(companyNames.length).toBeGreaterThan(0);
    expect(companyNames[0]).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<App />);
    expect(screen.getAllByText('회사소개')[0]).toBeInTheDocument();
    expect(screen.getAllByText('서비스')[0]).toBeInTheDocument();
    expect(screen.getAllByText('대표 프로필')[0]).toBeInTheDocument();
    expect(screen.getAllByText('문의하기')[0]).toBeInTheDocument();
  });

  test('renders footer', () => {
    render(<App />);
    const footerElements = screen.getAllByText('에멜무지로');
    expect(footerElements.length).toBeGreaterThan(0);
  });
});
