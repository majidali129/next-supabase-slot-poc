import Link from "next/link";

import { getPublicTodos } from "@/lib/todos";

// ISR: rebuilt in the background at most once every 30 seconds, so this
// page is served statically from cache but stays reasonably fresh.
export const revalidate = 30;

export const metadata = {
  title: "Todos",
};

export default async function PublicTodosPage() {
  const todos = await getPublicTodos();
  const generatedAt = new Date().toLocaleTimeString();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Public todo feed</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Read-only across every account. Rendered with{" "}
        <span className="font-mono">revalidate = 30</span> (ISR) on top of an{" "}
        <span className="font-mono">unstable_cache</span> data layer — page generated at{" "}
        {generatedAt}. Click a todo for its detail page.
      </p>

      <ul className="mt-6 flex flex-col gap-2">
        {todos.length === 0 ? (
          <li className="rounded-md border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No todos yet.{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>{" "}
            to create some.
          </li>
        ) : null}
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <Link
              href={`/todos/${todo.id}`}
              className={
                todo.isDone
                  ? "text-sm text-zinc-400 line-through hover:underline"
                  : "text-sm text-zinc-950 hover:underline dark:text-zinc-50"
              }
            >
              {todo.title}
            </Link>
            <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
              {todo.isDone ? "Done" : "Open"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
