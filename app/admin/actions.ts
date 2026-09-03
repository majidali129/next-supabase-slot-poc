"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createTodo, deleteTodo, setTodoDone, updateTodoTitle } from "@/lib/todos";
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

function revalidateTodoViews() {
  revalidatePath("/admin");
  revalidatePath("/todos");
}

export async function createTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "").trim();

  if (title.length > 0) {
    await createTodo(userId, title);
  }

  revalidateTodoViews();
}

export async function toggleTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  const isDone = formData.get("isDone") === "true";

  await setTodoDone(userId, id, isDone);
  revalidateTodoViews();
}

export async function updateTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (title.length > 0) {
    await updateTodoTitle(userId, id, title);
  }

  revalidateTodoViews();
}

export async function deleteTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");

  await deleteTodo(userId, id);
  revalidateTodoViews();
}
