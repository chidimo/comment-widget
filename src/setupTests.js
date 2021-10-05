// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

beforeAll(() => {});

afterEach(() => {});

afterAll(() => {});

const actualGetSelection = window.getSelection;

Object.defineProperty(window, 'getSelection', {
  ...actualGetSelection,
  getRangeAt: () => ({
    ...actualGetSelection.getRangeAt,
    cloneRange: () => ({
      ...actualGetSelection.getRangeAt.cloneRange,
      getClientRects: () => jest.fn(),
    }),
  }),

  writable: true,
});
