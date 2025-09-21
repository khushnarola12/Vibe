export { };
/**
 * Wrapper to re-export tests from init.auth.guard.test.ts for runners that only match *.spec.ts
 * This keeps a single source of truth for the test bodies while satisfying various glob patterns.
 */
import './init.auth.guard.test';