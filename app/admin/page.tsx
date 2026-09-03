import { redirect } from "next/navigation";

import { createTodoAction, deleteTodoAction, toggleTodoAction, updateTodoAction } from "./actions";
import { getTodosForUser } from "@/lib/todos";
import { signOut } from "@/lib/auth-actions";
import { createClient } from "@/utils/supabase/server";

// This route reads the session cookie on every request, so it's always
// server-rendered per-user rather than served from the static shell.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  // The proxy already redirects unauthenticated visits away from /admin;
  // this is a defense-in-depth check in case that ever changes.
  if (error || !userId) {
    redirect("/login?redirectTo=/admin");
  }

  const email = data?.claims?.email;
  const todos = await getTodosForUser(userId);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Your todos</h1>
          {email ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Signed in as {email}</p>
          ) : null}
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </form>
      </header>

      <form action={createTodoAction} className="mt-8 flex gap-2">
        <input
          type="text"
          name="title"
          required
          placeholder="What needs doing?"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Add
        </button>
      </form>

      <ul className="mt-6 flex flex-col gap-2">
        {todos.length === 0 ? (
          <li className="rounded-md border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No todos yet. Add your first one above.
          </li>
        ) : null}
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <form action={toggleTodoAction}>
              <input type="hidden" name="id" value={todo.id} />
              <input type="hidden" name="isDone" value={(!todo.isDone).toString()} />
              <button
                type="submit"
                aria-label={todo.isDone ? "Mark as not done" : "Mark as done"}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                  todo.isDone
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-zinc-300 text-transparent dark:border-zinc-600"
                }`}
              >
                ✓
              </button>
            </form>

            <form action={updateTodoAction} className="flex flex-1 items-center gap-2">
              <input type="hidden" name="id" value={todo.id} />
              <input
                type="text"
                name="title"
                defaultValue={todo.title}
                className={`flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-zinc-300 dark:focus:border-zinc-700 ${
                  todo.isDone ? "text-zinc-400 line-through" : "text-zinc-950 dark:text-zinc-50"
                }`}
              />
              <button
                type="submit"
                className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                Save
              </button>
            </form>

            <form action={deleteTodoAction}>
              <input type="hidden" name="id" value={todo.id} />
              <button
                type="submit"
                className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
