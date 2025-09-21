/**
 * Tests for messagesRouter (getMany, create)
 *
 * Testing library/framework note:
 * - No existing test framework detected in the repository. These tests use Vitest-style APIs (describe/it/expect, vi.mock).
 * - If you use Jest, replace `vi` with `jest` and adjust imports accordingly (e.g., import { jest as vi } from "@jest/globals").
 *
 * Focus: Validates the behavior introduced/modified in procedures.ts:
 *  - getMany: input validation, filtering by ctx.auth.userId, include and orderBy options
 *  - create: project ownership check (NOT_FOUND), payload shape to prisma.message.create, inngest event dispatch,
 *            input validation (min/max), and error propagation (DB failure, inngest failure)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
// If using Jest instead, comment line above and uncomment below:
// import { describe, it, expect, beforeEach, jest as vi } from "@jest/globals";
import { TRPCError } from "@trpc/server";

// Mocks: prisma and inngest
const prismaMessageFindMany = vi.fn();
const prismaMessageCreate = vi.fn();
const prismaProjectFindUnique = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    message: {
      findMany: prismaMessageFindMany,
      create: prismaMessageCreate,
    },
    project: {
      findUnique: prismaProjectFindUnique,
    },
  },
  __esModule: true,
}));

const inngestSend = vi.fn();
vi.mock("@/inngest/client", () => ({
  inngest: {
    send: inngestSend,
  },
  __esModule: true,
}));

// Import SUT after mocks
import { messagesRouter } from "../procedures";

// Helpers
const makeCaller = (userId: string | null | undefined) =>
  messagesRouter.createCaller({ auth: { userId } } as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("messagesRouter.getMany", () => {
  it("returns messages for the user's project with correct query options", async () => {
    const userId = "user_123";
    const projectId = "proj_001";
    const mockMessages = [
      { id: "m1", projectId, content: "Hello", updatedAt: new Date("2023-01-01") },
      { id: "m2", projectId, content: "World", updatedAt: new Date("2023-01-02") },
    ];
    prismaMessageFindMany.mockResolvedValueOnce(mockMessages);

    const caller = makeCaller(userId);
    const result = await caller.getMany({ projectId });

    expect(prismaMessageFindMany).toHaveBeenCalledTimes(1);
    expect(prismaMessageFindMany).toHaveBeenCalledWith({
      where: {
        projectId,
        project: { userId },
      },
      include: {
        fragement: true,
      },
      orderBy: { updatedAt: "asc" },
    });
    expect(result).toEqual(mockMessages);
  });

  it("returns an empty array when no messages exist", async () => {
    prismaMessageFindMany.mockResolvedValueOnce([]);
    const caller = makeCaller("user_xyz");
    const result = await caller.getMany({ projectId: "no_msgs_proj" });
    expect(result).toEqual([]);
  });

  it("rejects with BAD_REQUEST when projectId is empty (validation)", async () => {
    const caller = makeCaller("user_123");
    await expect(
      // @ts-expect-error invalid input to trigger zod error
      caller.getMany({ projectId: "" })
    ).rejects.toHaveProperty("code", "BAD_REQUEST");
    expect(prismaMessageFindMany).not.toHaveBeenCalled();
  });

  it("rejects with UNAUTHORIZED when user is not authenticated", async () => {
    const caller = makeCaller(undefined);
    await expect(
      caller.getMany({ projectId: "proj_unauth" })
    ).rejects.toBeInstanceOf(TRPCError);
    await expect(
      caller.getMany({ projectId: "proj_unauth" })
    ).rejects.toHaveProperty("code", "UNAUTHORIZED");
    expect(prismaMessageFindMany).not.toHaveBeenCalled();
  });
});

describe("messagesRouter.create", () => {
  it("creates a message and dispatches an inngest event", async () => {
    const userId = "user_abc";
    const input = { value: "Run code", projectId: "proj_007" };
    const existingProject = { id: input.projectId, userId };
    const createdMessage = {
      id: "msg_1",
      projectId: existingProject.id,
      content: input.value,
      role: "USER",
      type: "RESULT",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaProjectFindUnique.mockResolvedValueOnce(existingProject);
    prismaMessageCreate.mockResolvedValueOnce(createdMessage);
    inngestSend.mockResolvedValueOnce({});

    const caller = makeCaller(userId);
    const result = await caller.create(input);

    expect(prismaProjectFindUnique).toHaveBeenCalledWith({
      where: { id: input.projectId, userId },
    });

    expect(prismaMessageCreate).toHaveBeenCalledWith({
      data: {
        projectId: existingProject.id,
        content: input.value,
        role: "USER",
        type: "RESULT",
      },
    });

    expect(inngestSend).toHaveBeenCalledWith({
      name: "code-agent/run",
      data: { value: input.value, projectId: input.projectId },
    });

    expect(result).toEqual(createdMessage);
  });

  it("throws NOT_FOUND when the project does not exist or does not belong to user", async () => {
    const userId = "user_abc";
    const input = { value: "Do it", projectId: "proj_missing" };
    prismaProjectFindUnique.mockResolvedValueOnce(null);

    const caller = makeCaller(userId);
    await expect(caller.create(input)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Project not found",
    });

    expect(prismaMessageCreate).not.toHaveBeenCalled();
    expect(inngestSend).not.toHaveBeenCalled();
  });

  it("rejects with BAD_REQUEST when value is empty (validation)", async () => {
    const caller = makeCaller("user_1");
    await expect(
      caller.create({ value: "", projectId: "p1" } as any)
    ).rejects.toHaveProperty("code", "BAD_REQUEST");
    expect(prismaProjectFindUnique).not.toHaveBeenCalled();
  });

  it("rejects with BAD_REQUEST when value exceeds 10000 characters (validation)", async () => {
    const caller = makeCaller("user_1");
    const long = "a".repeat(10001);
    await expect(
      caller.create({ value: long, projectId: "p1" })
    ).rejects.toHaveProperty("code", "BAD_REQUEST");
    expect(prismaProjectFindUnique).not.toHaveBeenCalled();
  });

  it("rejects with UNAUTHORIZED when user is not authenticated", async () => {
    const caller = makeCaller(null);
    await expect(
      caller.create({ value: "x", projectId: "p1" })
    ).rejects.toBeInstanceOf(TRPCError);
    await expect(
      caller.create({ value: "x", projectId: "p1" })
    ).rejects.toHaveProperty("code", "UNAUTHORIZED");
    expect(prismaProjectFindUnique).not.toHaveBeenCalled();
  });

  it("propagates database errors from prisma.message.create", async () => {
    const userId = "user_ok";
    const input = { value: "Hello", projectId: "p-ok" };
    prismaProjectFindUnique.mockResolvedValueOnce({ id: "p-ok", userId });
    prismaMessageCreate.mockRejectedValueOnce(new Error("DB failure"));

    const caller = makeCaller(userId);
    await expect(caller.create(input)).rejects.toThrow("DB failure");

    // Ensure inngest.send was not called when creation fails
    expect(inngestSend).not.toHaveBeenCalled();
  });

  it("propagates errors when inngest.send fails after creation", async () => {
    const userId = "user_ok";
    const input = { value: "Hello", projectId: "p-ok" };
    const createdMessage = {
      id: "mX",
      projectId: input.projectId,
      content: input.value,
      role: "USER",
      type: "RESULT",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaProjectFindUnique.mockResolvedValueOnce({ id: "p-ok", userId });
    prismaMessageCreate.mockResolvedValueOnce(createdMessage);
    inngestSend.mockRejectedValueOnce(new Error("Inngest down"));

    const caller = makeCaller(userId);
    await expect(caller.create(input)).rejects.toThrow("Inngest down");

    // Ensure the message creation still happened
    expect(prismaMessageCreate).toHaveBeenCalledTimes(1);
  });
});