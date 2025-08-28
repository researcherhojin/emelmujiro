import reportWebVitals from '../reportWebVitals';
import { vi } from 'vitest';

describe('reportWebVitals', () => {
  it('does not throw when called with a valid function', () => {
    const onPerfEntry = vi.fn();
    expect(() => reportWebVitals(onPerfEntry)).not.toThrow();
  });

  it('does not throw when called without arguments', () => {
    expect(() => reportWebVitals()).not.toThrow();
  });

  it('does not throw when called with null', () => {
    expect(() =>
      reportWebVitals(null as unknown as Parameters<typeof reportWebVitals>[0])
    ).not.toThrow();
  });

  it('does not throw when called with undefined', () => {
    expect(() => reportWebVitals(undefined)).not.toThrow();
  });

  it('does not throw when called with non-function values', () => {
    expect(() =>
      reportWebVitals(
        'string' as unknown as Parameters<typeof reportWebVitals>[0]
      )
    ).not.toThrow();
    expect(() =>
      reportWebVitals(123 as unknown as Parameters<typeof reportWebVitals>[0])
    ).not.toThrow();
    expect(() =>
      reportWebVitals({} as unknown as Parameters<typeof reportWebVitals>[0])
    ).not.toThrow();
    expect(() =>
      reportWebVitals([] as unknown as Parameters<typeof reportWebVitals>[0])
    ).not.toThrow();
  });
});
