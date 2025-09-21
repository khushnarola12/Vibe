/**
 * Unit tests for src/trpc/init.test.ts
 *
 * Test Runner:
 * - This suite is compatible with both Vitest and Jest.
 * - It auto-detects "vi" (Vitest) and falls back to Jest globals.
 *
 * What is tested:
 * - createTRPCContext: calls Clerk auth and returns expected shape; memoization via react/cache is stubbed.
 * - protectedProcedure middleware behavior:
 *   - denies when no userId
 *   - denies when empty string userId
 *   - allows when userId is present and passes ctx.auth through
 * - baseProcedure and createCallerFactory basics via a tiny test router
 */

type TestGlobals = typeof import('vitest') | typeof import('@jest/globals');

let t: TestGlobals;
try {
  // Vitest environment
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  t = require('vitest');
} catch {
  // Jest environment
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  t = require('@jest/globals');
}

const { describe, it, expect, beforeEach, vi: maybeVi } = t as any;

// Polyfill vi for Jest environments (subset used here)
const vi = (maybeVi ?? {
  fn: (impl?: any) => {
    const j = (global as any).jest ?? require('jest-mock');
    return j.fn(impl);
  },
  spyOn: (obj: any, key: any) => {
    const j = (global as any).jest ?? require('jest-mock');
    return j.spyOn(obj, key);
  },
  resetModules: () => {
    // Jest provides resetModules via jest.resetModules
    const j = (global as any).jest;
    if (j && typeof j.resetModules === 'function') j.resetModules();
  },
  clearAllMocks: () => {
    const j = (global as any).jest;
    if (j && typeof j.clearAllMocks === 'function') j.clearAllMocks();
  },
});

// Mock react's cache to identity to avoid server-specific caching behavior in tests
vi.resetModules?.();
vi.clearAllMocks?.();

vi.mock('react', () => ({
  cache: (fn: any) => fn,
}));

// Mock Clerk auth to be controllable per-test
let mockAuthImpl: () => Promise<any>;
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuthImpl(),
}));

// Import module under test using relative path
// Note: The module file is named init.test.ts in the repo; we import it as a module.
import type { inferRouterContext } from '@trpc/server';
import * as trpcInit from '../../trpc/init.test';

type Ctx = trpcInit.Context;

describe('tRPC init (protectedProcedure, context, and helpers)', () => {
  beforeEach(() => {
    vi.clearAllMocks?.();
    mockAuthImpl = async () => ({ userId: 'test-user' });
  });

  it('createTRPCContext calls Clerk auth and returns expected shape', async () => {
    const authSpy = vi.fn(async () => ({ userId: 'abc123', sessionId: 'sess_1' }));
    mockAuthImpl = authSpy;

    const ctx = await trpcInit.createTRPCContext();
    expect(authSpy).toHaveBeenCalledTimes(1);

    expect(ctx).toBeTruthy();
    expect(ctx).toHaveProperty('auth');
    expect(ctx.auth.userId).toBe('abc123');

    // Subsequent calls also work (cache is stubbed to identity so it will call again)
    const ctx2 = await trpcInit.createTRPCContext();
    expect(authSpy).toHaveBeenCalledTimes(2);
    expect(ctx2.auth.userId).toBe('abc123');
  });

  it('protectedProcedure denies when no userId (TRPCError UNAUTHORIZED)', async () => {
    mockAuthImpl = async () => ({ userId: undefined });

    // Build a minimal router exposing a protected query
    const router = trpcInit.createTRPCRouter({
      whoami: trpcInit.protectedProcedure.query(({ ctx }) => ({
        userId: ctx.auth.userId,
      })),
    });

    const createCaller = trpcInit.createCallerFactory(router);
    const caller = createCaller({ auth: await mockAuthImpl() } as Ctx);

    await expect(caller.whoami()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Not Authorized',
    });
  });

  it('protectedProcedure denies when userId is an empty string', async () => {
    mockAuthImpl = async () => ({ userId: '' });

    const router = trpcInit.createTRPCRouter({
      whoami: trpcInit.protectedProcedure.query(({ ctx }) => ({
        userId: ctx.auth.userId,
      })),
    });

    const createCaller = trpcInit.createCallerFactory(router);
    const caller = createCaller({ auth: await mockAuthImpl() } as Ctx);

    await expect(caller.whoami()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Not Authorized',
    });
  });

  it('protectedProcedure allows when userId is present and passes ctx.auth through intact', async () => {
    mockAuthImpl = async () => ({ userId: 'u_42', roles: ['member'] });

    const router = trpcInit.createTRPCRouter({
      whoami: trpcInit.protectedProcedure.query(({ ctx }) => ({
        uid: ctx.auth.userId,
        roles: (ctx.auth as any).roles ?? [],
      })),
    });

    const createCaller = trpcInit.createCallerFactory(router);
    const injectedCtx = { auth: await mockAuthImpl() } as Ctx;
    const caller = createCaller(injectedCtx);
    const result = await caller.whoami();

    expect(result).toEqual({ uid: 'u_42', roles: ['member'] });
  });

  it('baseProcedure can be used to create a simple public endpoint', async () => {
    const router = trpcInit.createTRPCRouter({
      ping: trpcInit.baseProcedure.query(() => 'pong'),
    });
    const createCaller = trpcInit.createCallerFactory(router);
    const caller = createCaller({ auth: { userId: undefined } } as any);

    await expect(caller.ping()).resolves.toBe('pong');
  });

  it('protectedProcedure throws TypeError if ctx.auth is unexpectedly missing (runtime misuse)', async () => {
    // This simulates a runtime misuse (should not happen with proper Context typing)
    const router = trpcInit.createTRPCRouter({
      whoami: trpcInit.protectedProcedure.query(({ ctx }) => ({
        uid: (ctx as any).auth?.userId,
      })),
    });
    const createCaller = trpcInit.createCallerFactory(router);
    const caller = createCaller({} as any); // missing auth entirely

    await expect(caller.whoami()).rejects.toBeInstanceOf(Error);
  });
});