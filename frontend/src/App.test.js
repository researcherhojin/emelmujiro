import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', async () => {
    const { container } = render(<App />);

    // Wait for lazy-loaded components
    await waitFor(() => {
      const appElement = container.querySelector('.App');
      expect(appElement).toBeInTheDocument();
    });
  });

  test('renders navbar with company name', async () => {
    render(<App />);

    // Wait for the navbar to be loaded
    await waitFor(() => {
      const companyNames = screen.queryAllByText('에멜무지로');
      expect(companyNames.length).toBeGreaterThan(0);
    });
  });

  test('renders navigation links', async () => {
    render(<App />);

    // Wait for navigation to be loaded
    await waitFor(() => {
      const aboutLinks = screen.queryAllByText('회사소개');
      expect(aboutLinks.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      const serviceLinks = screen.queryAllByText('서비스');
      expect(serviceLinks.length).toBeGreaterThan(0);
    });
  });

  test('renders footer', async () => {
    render(<App />);

    // Wait for footer to be loaded
    await waitFor(() => {
      const footerElements = screen.queryAllByText(/에멜무지로/);
      expect(footerElements.length).toBeGreaterThan(0);
    });
  });
});
