import { prisma } from "@/lib/prisma";

export type PublicTodo = {
  id: string;
  title: string;
  isDone: boolean;
  createdAt: Date;
};

/** Read-only feed of the most recent todos across every user, for the public /todos page. */
export async function getPublicTodos(limit = 50): Promise<PublicTodo[]> {
  return prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      isDone: true,
      createdAt: true,
    },
  });
}

/** Full todos for one authenticated user, for the admin dashboard. */
export async function getTodosForUser(userId: string) {
  return prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
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
