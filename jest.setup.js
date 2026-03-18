// Jest setup file
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: (props) => {
    return <a {...props} />;
  },
}));

// Mock performance API
global.performance = {
  getEntriesByType: jest.fn(() => [
    {
      domContentLoadedEventEnd: 100,
      domContentLoadedEventStart: 90,
      loadEventEnd: 200,
      loadEventStart: 150,
      responseStart: 50,
      navigationStart: 0,
    },
  ]),
};

// Mock Service Worker
global.navigator = {
  ...global.navigator,
  serviceWorker: {
    register: jest.fn(() => Promise.resolve({})),
    ready: Promise.resolve({}),
  },
};

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('ReactDOM.render is no longer supported') ||
     args[0].includes('componentWillReceiveProps'))
  ) {
    return;
  }
  originalWarn(...args);
};

// Suppress console.error in tests unless it's a test failure
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || args[0].includes('An error occurred'))
  ) {
    return;
  }
  originalError(...args);
};
