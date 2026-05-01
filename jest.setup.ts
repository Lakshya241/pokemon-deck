import "@testing-library/jest-dom";
import { configureAxe } from "jest-axe";

// Extend jest-axe matchers
expect.extend(configureAxe());

// Suppress console.error noise from React in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning:") || args[0].includes("ReactDOM.render"))
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
