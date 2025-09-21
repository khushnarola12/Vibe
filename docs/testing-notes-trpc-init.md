Testing notes for src/trpc/init.test.ts

- These tests are authored in TypeScript and are compatible with both Vitest and Jest runners.
- The suite conditionally imports from 'vitest' first and then '@jest/globals'.
- External dependencies are mocked:
  - 'react': cache is stubbed to an identity function to avoid server-only caching semantics in unit tests.
  - '@clerk/nextjs/server': auth() is mocked per-test to control userId and simulate authorized/unauthorized states.
- If your project uses only one runner (e.g., Vitest), you may simplify the top-of-file globals accordingly.