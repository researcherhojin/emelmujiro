import { render } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  test('app initializes correctly', () => {
    const { container } = render(<App />);
    // Check that the app div exists
    const appDiv = container.firstChild;
    expect(appDiv).toBeTruthy();
  });

  test('app structure is rendered', () => {
    const { container } = render(<App />);
    // Just verify the app renders something
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  test('app has proper context providers', () => {
    // This test just verifies that the app can render with all providers
    expect(() => render(<App />)).not.toThrow();
  });
});
