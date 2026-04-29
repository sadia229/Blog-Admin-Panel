# Blog Admin Portal

A self-contained Next.js blog admin portal with:

- Create/edit tab with a custom folder name, title, content, publishing, updating, and AI generation.
- All Posts tab with folder filters, pagination, edit actions, and delete actions.
- Supabase CRUD persistence when environment variables are configured.
- Optional Claude content generation via `ANTHROPIC_API_KEY`.

## Run locally

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3001/.

## Supabase setup

Create a `posts` table:

```sql
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  folder text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);
```

For a simple local admin portal, authentication is not required. If Row Level Security is enabled and you want anonymous CRUD for this local admin tool, add policies like:

```sql
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
```

For a public or production admin portal, use Supabase Auth and restrict these policies to authenticated admin users.

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zclvhwqnucqizibddvpm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_tZ15siLsPK1dk6p1-W5qOg_PK-GTGJN
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
ANTHROPIC_API_KEY=your-claude-api-key
```

If `NEXT_PUBLIC_ADMIN_USERNAME` and `NEXT_PUBLIC_ADMIN_PASSWORD` are set, the app will require admin login before showing the portal.

If you see `Could not find the table 'public.posts' in the schema cache`, create the `posts` table in your Supabase project by running the SQL in `supabase/init.sql` or the query above.
