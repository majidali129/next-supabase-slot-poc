"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  createTodo,
  deleteTodo,
  publicTodoTag,
  PUBLIC_TODOS_TAG,
  setTodoDone,
  updateTodoTitle,
  userTodosTag,
} from "@/lib/todos";
import { createClient } from "@/utils/supabase/server";

/**
 * The proxy already blocks unauthenticated visits to /admin, but Server
 * Actions are reachable directly over POST, so every action re-checks auth.
 */
async function requireUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    redirect("/login?redirectTo=/admin");
  }

  return userId;
}

/**
 * Invalidates both the ISR page cache (`revalidatePath`, for the next visit)
 * and the underlying `unstable_cache` data (`revalidateTag`, for the cached
 * Prisma reads in lib/todos.ts) so admin edits show up everywhere promptly.
 */
function revalidateTodoViews(userId: string, todoId?: string) {
  revalidatePath("/admin");
  revalidatePath("/todos");
  if (todoId) revalidatePath(`/todos/${todoId}`);

  revalidateTag(userTodosTag(userId), "max");
  revalidateTag(PUBLIC_TODOS_TAG, "max");
  if (todoId) revalidateTag(publicTodoTag(todoId), "max");
}

export async function createTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "").trim();

  let createdId: string | undefined;
  if (title.length > 0) {
    const todo = await createTodo(userId, title);
    createdId = todo.id;
  }

  revalidateTodoViews(userId, createdId);
}

export async function toggleTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  const isDone = formData.get("isDone") === "true";

  await setTodoDone(userId, id, isDone);
  revalidateTodoViews(userId, id);
}

export async function updateTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (title.length > 0) {
    await updateTodoTitle(userId, id, title);
  }

  revalidateTodoViews(userId, id);
}

export async function deleteTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");

  await deleteTodo(userId, id);
  revalidateTodoViews(userId, id);
}
