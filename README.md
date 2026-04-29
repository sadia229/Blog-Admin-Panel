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

