/**
 * Unit tests for projectsRouter procedures.
 * Framework: Jest (or Vitest-compatible with vi.fn/vi.mock).
 * This suite mocks:
 *  - "@/lib/db" prisma client (project.findUnique/findMany/create)
 *  - "@/inngest/client" for inngest.send
 *  - "random-word-slugs" generateSlug to produce deterministic names
 *
 * It validates:
 *  - getOne: success path and NOT_FOUND behavior
 *  - getMany: ordering and filtering by userId
 *  - create: payload to prisma, event emission to inngest, and return value
 *  - input validation edge cases (reject empty or overly long value)
 */

const usingVitest = typeof vi !== "undefined"; // Vitest global guard
const testFramework = (global as any).jest || (usingVitest ? vi : undefined);
if (!testFramework) {
  throw new Error("No jest/vi globals detected. Please run with Jest or Vitest.");
}

// Mocks for path aliases are resolved via jest/tsconfig alias. Ensure moduleNameMapper or aliases are configured.
testFramework.mock("@/lib/db", () => {
  return {
    prisma: {
      project: {
        findUnique: testFramework.fn(),
        findMany: testFramework.fn(),
        create: testFramework.fn(),
      },
    },
  };
});

testFramework.mock("@/inngest/client", () => {
  return {
    inngest: {
      send: testFramework.fn(),
    },
  };
});

testFramework.mock("random-word-slugs", () => {
  return {
    generateSlug: testFramework.fn(() => "alpha-bravo"),
  };
});

// Import mocks to reference in assertions
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { TRPCError } from "@trpc/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Attempt robust import of the router, accommodating PR path anomalies.
let projectsRouter: any;
try {
  // If the PR mistakenly named the source with .test.ts, import from there.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  projectsRouter = require("../procedures.test").projectsRouter;
} catch {
  // Fallback to conventional name
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  projectsRouter = require("../procedures").projectsRouter;
}

type RouterInputs = inferRouterInputs<typeof projectsRouter>;
type RouterOutputs = inferRouterOutputs<typeof projectsRouter>;

// Helper to make a caller with minimal ctx required by protectedProcedure
const makeCaller = (userId = "user_123") =>
  projectsRouter.createCaller({
    auth: { userId },
  });

describe("projectsRouter", () => {
  const resetMocks = () => {
    (prisma.project.findUnique as any).mockReset();
    (prisma.project.findMany as any).mockReset();
    (prisma.project.create as any).mockReset();
    (inngest.send as any).mockReset();
  };

  beforeEach(() => {
    resetMocks();
  });

  describe("getOne", () => {
    test("returns project when found for the authenticated user", async () => {
      const caller = makeCaller("u1");
      const project = { id: "p1", userId: "u1", name: "x", updatedAt: new Date() };
      (prisma.project.findUnique as any).mockResolvedValue(project);

      const result: RouterOutputs["getOne"] = await caller.getOne({ id: "p1" });

      expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: "p1", userId: "u1" },
      });
      expect(result).toEqual(project);
    });

    test("throws NOT_FOUND when project does not exist for the user", async () => {
      const caller = makeCaller("u2");
      (prisma.project.findUnique as any).mockResolvedValue(null);

      await expect(caller.getOne({ id: "missing" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
      await expect(caller.getOne({ id: "missing" })).rejects.toBeInstanceOf(TRPCError);
    });

    test("validates input: id must be non-empty", async () => {
      const caller = makeCaller("u3");
      // @ts-expect-error - intentionally invalid to assert validation
      await expect(caller.getOne({ id: "" })).rejects.toBeTruthy();
    });
  });

  describe("getMany", () => {
    test("returns projects ordered by updateAt desc for the authenticated user", async () => {
      const caller = makeCaller("u5");
      const projects = [
        { id: "p2", userId: "u5", name: "b", updateAt: new Date("2025-01-01") },
        { id: "p3", userId: "u5", name: "c", updateAt: new Date("2025-01-02") },
      ];
      (prisma.project.findMany as any).mockResolvedValue(projects);

      const result: RouterOutputs["getMany"] = await caller.getMany();

      expect(prisma.project.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { userId: "u5" },
        orderBy: { updateAt: "desc" },
      });
      expect(result).toBe(projects);
    });

    test("returns empty array when user has no projects", async () => {
      const caller = makeCaller("u6");
      (prisma.project.findMany as any).mockResolvedValue([]);

      const result: RouterOutputs["getMany"] = await caller.getMany();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });

  describe("create", () => {
    test("creates a project with slugified name, initial message, and emits run event", async () => {
      const caller = makeCaller("u9");
      const created = {
        id: "new_project_id",
        userId: "u9",
        name: "alpha-bravo",
        updateAt: new Date(),
      };
      (prisma.project.create as any).mockResolvedValue(created);

      const input: RouterInputs["create"] = { value: "Hello world" };
      const result: RouterOutputs["create"] = await caller.create(input);

      // prisma call
      expect(prisma.project.create).toHaveBeenCalledTimes(1);
      const prismaArg = (prisma.project.create as any).mock.calls[0][0];
      expect(prismaArg).toMatchObject({
        data: {
          userId: "u9",
          name: "alpha-bravo",
          messages: {
            create: {
              content: "Hello world",
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      // inngest event
      expect(inngest.send).toHaveBeenCalledTimes(1);
      expect(inngest.send).toHaveBeenCalledWith({
        name: "code-agent/run",
        data: { value: "Hello world", projectId: "new_project_id" },
      });

      // return value
      expect(result).toEqual(created);
    });

    test("validates input: rejects empty value", async () => {
      const caller = makeCaller("u10");
      // @ts-expect-error - intentionally invalid
      await expect(caller.create({ value: "" })).rejects.toBeTruthy();
      expect(prisma.project.create).not.toHaveBeenCalled();
      expect(inngest.send).not.toHaveBeenCalled();
    });

    test("validates input: rejects overly long value", async () => {
      const caller = makeCaller("u11");
      const long = "a".repeat(10001);
      // @ts-expect-error - intentionally invalid
      await expect(caller.create({ value: long })).rejects.toBeTruthy();
      expect(prisma.project.create).not.toHaveBeenCalled();
      expect(inngest.send).not.toHaveBeenCalled();
    });

    test("propagates prisma errors during create", async () => {
      const caller = makeCaller("u12");
      (prisma.project.create as any).mockRejectedValue(new Error("DB down"));

      await expect(caller.create({ value: "x" })).rejects.toThrow("DB down");
      expect(inngest.send).not.toHaveBeenCalled();
    });
  });
});