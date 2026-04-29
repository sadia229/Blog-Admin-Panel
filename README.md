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

## Environment variables

Copy `.env.example` to `.env.local` and set the values for your Supabase project.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
ANTHROPIC_API_KEY=your-claude-api-key
```

If your deployment uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, that variable is also supported for compatibility.

## Deploying to Vercel

Vercel does not use `.env.local` from the repository. Add the same variables to your Vercel project settings under Environment Variables.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_USERNAME`
- `NEXT_PUBLIC_ADMIN_PASSWORD`
- `ANTHROPIC_API_KEY` (optional)

Then redeploy the project.

