// Import in tests when running Vitest to provide "jest" alias:
//   import 'test-utils/jest-vi-compat';

const g = globalThis as any;
if (typeof g.vi !== "undefined") {
  g.jest = g.vi;
}
export {};