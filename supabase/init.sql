-- Run this in your Supabase project's SQL editor to create the posts table
-- used by the blog admin portal.

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  folder text not null,
  author text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table posts add column if not exists author text not null default '';

-- If Row Level Security is enabled, allow anonymous CRUD for this local admin tool.
alter table posts enable row level security;

create policy "Allow anon read posts"
  on posts for select
  to anon
  using (true);

create policy "Allow anon create posts"
  on posts for insert
  to anon
  with check (true);

create policy "Allow anon update posts"
  on posts for update
  to anon
  using (true)
  with check (true);

create policy "Allow anon delete posts"
  on posts for delete
  to anon
  using (true);
