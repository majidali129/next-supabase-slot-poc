import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

export type PublicTodo = {
  id: string;
  title: string;
  isDone: boolean;
  createdAt: Date;
};

// Cache tags let Server Actions invalidate exactly what changed via
// `revalidateTag` instead of re-running every query on every request.
export const PUBLIC_TODOS_TAG = "todos:public";
export const publicTodoTag = (id: string) => `todos:public:${id}`;
export const userTodosTag = (userId: string) => `todos:user:${userId}`;

/**
 * Read-only feed of the most recent todos across every user, for the public
 * /todos page. Wrapped in `unstable_cache` so repeated requests (and the ISR
 * background revalidation) reuse the same cached rows until the `revalidate`
 * window elapses or `PUBLIC_TODOS_TAG` is invalidated.
 */
export async function getPublicTodos(limit = 50): Promise<PublicTodo[]> {
  return unstable_cache(
    async () =>
      prisma.todo.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          isDone: true,
          createdAt: true,
        },
      }),
    ["public-todos", String(limit)],
    { tags: [PUBLIC_TODOS_TAG], revalidate: 30 }
  )();
}

/** Single public todo for the /todos/[id] detail page (SSG + ISR). */
export async function getPublicTodoById(id: string): Promise<PublicTodo | null> {
  return unstable_cache(
    async () =>
      prisma.todo.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          isDone: true,
          createdAt: true,
        },
      }),
    ["public-todo-by-id", id],
    { tags: [PUBLIC_TODOS_TAG, publicTodoTag(id)], revalidate: 30 }
  )();
}

/**
 * Full todos for one authenticated user, for the admin dashboard. The page
 * itself is still force-dynamic (it depends on the session cookie), but this
 * caches the underlying DB read per-user so repeat admin requests within the
 * revalidate window - or before the user's own mutation invalidates the tag
 * - skip the round trip to Postgres.
 */
export async function getTodosForUser(userId: string) {
  return unstable_cache(
    async () =>
      prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ["todos-for-user", userId],
    { tags: [userTodosTag(userId)], revalidate: 60 }
  )();
}

export async function createTodo(userId: string, title: string) {
  return prisma.todo.create({
    data: { userId, title },
  });
}

export async function setTodoDone(userId: string, id: string, isDone: boolean) {
  // Scoping the `where` by userId doubles as the authorization check: a
  // mismatched id/userId pair simply matches zero rows instead of leaking data.
  return prisma.todo.updateMany({
    where: { id, userId },
    data: { isDone },
  });
}

export async function updateTodoTitle(userId: string, id: string, title: string) {
  return prisma.todo.updateMany({
    where: { id, userId },
    data: { title },
  });
}

export async function deleteTodo(userId: string, id: string) {
  return prisma.todo.deleteMany({
    where: { id, userId },
  });
}
