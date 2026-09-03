import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicTodoById, getPublicTodos } from "@/lib/todos";

// ISR: the todos known at build time are prerendered below via
// `generateStaticParams`; anything created afterwards is rendered on its
// first visit and then cached the same way (`dynamicParams` defaults to
// true). Either way, the cached page is revalidated in the background at
// most once every 30 seconds.
export const revalidate = 30;

export async function generateStaticParams() {
  const todos = await getPublicTodos();
  return todos.map((todo) => ({ id: todo.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const todo = await getPublicTodoById(id);

  return { title: todo ? todo.title : "Todo not found" };
}

export default async function PublicTodoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const todo = await getPublicTodoById(id);

  if (!todo) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <Link href="/todos" className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300">
        ← Back to all todos
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{todo.title}</h1>

      <dl className="mt-6 flex flex-col gap-3 rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
          <dd className={todo.isDone ? "font-medium text-emerald-600" : "font-medium text-zinc-700 dark:text-zinc-300"}>
            {todo.isDone ? "Done" : "Open"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
          <dd className="text-zinc-700 dark:text-zinc-300">{todo.createdAt.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500 dark:text-zinc-400">ID</dt>
          <dd className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{todo.id}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
        Rendered with <span className="font-mono">revalidate = 30</span> (ISR) via{" "}
        <span className="font-mono">generateStaticParams</span>.
      </p>
    </div>
  );
}
