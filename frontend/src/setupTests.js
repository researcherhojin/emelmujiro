// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    media: "",
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  disconnect() {
    return null;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock Service Worker
global.navigator.serviceWorker = {
  register: jest.fn(() => Promise.resolve()),
  ready: Promise.resolve({
    unregister: jest.fn(() => Promise.resolve()),
  }),
};