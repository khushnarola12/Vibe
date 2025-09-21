Testing library/framework:
- None detected in package.json. Tests are authored with Vitest-style APIs (vi.mock, describe/it/expect).
- If your project uses Jest, replace `vi` with `jest` and adjust imports accordingly.

What these tests cover:
- getMany: validation (BAD_REQUEST), user scoping (auth.userId), include/orderBy shape, empty results, unauthorized (UNAUTHORIZED)
- create: project ownership (NOT_FOUND), message creation payload, inngest event dispatch, validation (min/max), unauthorized,
          error propagation from prisma.message.create and from inngest.send