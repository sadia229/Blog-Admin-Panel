import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { title, folder } = await request.json();

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "A title is required." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      content: fallbackDraft(title, folder),
      source: "fallback"
    });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 900,
      messages: [
        {
          role: "user",
          content: `Write a polished blog post for the "${folder}" folder with this title: "${title}". Use a strong introduction, useful sections, and a practical closing.`
        }
      ]
    })
  });

  if (!response.ok) {
    return NextResponse.json({
      content: fallbackDraft(title, folder),
      source: "fallback"
    });
  }

  const data = await response.json();
  const content = data?.content?.[0]?.text;

  return NextResponse.json({
    content: content || fallbackDraft(title, folder),
    source: content ? "claude" : "fallback"
  });
}

function fallbackDraft(title: string, folder = "General") {
  return `# ${title}

Every strong blog post starts with a clear promise. For ${folder}, that means giving readers a practical angle they can use right away.

## Why this matters

The topic is worth exploring because it connects directly to everyday decisions, trends, and opportunities. A good article should explain the context without slowing the reader down.

## Key ideas

- Start with the problem readers already recognize.
- Add examples that make the point feel concrete.
- Keep each section focused on one useful takeaway.

## Final thoughts

The best next step is to turn the idea into action. Keep the post specific, honest, and easy to scan so readers leave with something they can apply.`;
}
