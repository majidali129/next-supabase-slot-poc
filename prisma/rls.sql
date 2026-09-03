-- Defense-in-depth: the app queries Postgres directly via Prisma (which
-- bypasses RLS), so these policies only matter if the Supabase Data API is
-- ever turned on for this table. Re-run with:
--   npx prisma db execute --file prisma/rls.sql
alter table public.todos enable row level security;

drop policy if exists "Users can view their own todos" on public.todos;
create policy "Users can view their own todos"
on public.todos for select
to authenticated
using ( (select auth.uid()) = user_id );

drop policy if exists "Users can insert their own todos" on public.todos;
create policy "Users can insert their own todos"
on public.todos for insert
to authenticated
with check ( (select auth.uid()) = user_id );

drop policy if exists "Users can update their own todos" on public.todos;
create policy "Users can update their own todos"
on public.todos for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

drop policy if exists "Users can delete their own todos" on public.todos;
create policy "Users can delete their own todos"
on public.todos for delete
to authenticated
using ( (select auth.uid()) = user_id );
