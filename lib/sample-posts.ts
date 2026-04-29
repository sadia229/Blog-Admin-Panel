import type { BlogPost } from "./supabase";

export const folders = [
  "Tech Trends",
  "Product",
  "Marketing",
  "Design",
  "Business",
  "Engineering"
] as const;

export const samplePosts: BlogPost[] = [
  {
    id: "sample-1",
    folder: "Tech Trends",
    title: "AI Assistants Are Becoming Everyday Workflows",
    content:
      "AI assistants are shifting from novelty tools into daily operating layers for writing, research, planning, and customer support. The teams getting the most value are treating them as workflow partners instead of one-off prompt boxes.",
    created_at: "2026-04-23T10:00:00.000Z"
  },
  {
    id: "sample-2",
    folder: "Product",
    title: "How to Prioritize Features Without Losing Momentum",
    content:
      "Product prioritization works best when teams combine customer pain, business value, implementation cost, and timing. A clear system keeps roadmap conversations grounded and gives stakeholders confidence in the next move.",
    created_at: "2026-04-22T11:30:00.000Z"
  },
  {
    id: "sample-3",
    folder: "Marketing",
    title: "Building Campaigns Around Useful Proof",
    content:
      "Modern buyers want evidence. Case studies, benchmarks, demos, and customer quotes make campaigns stronger because they answer the question behind every click: can this actually help me?",
    created_at: "2026-04-21T13:15:00.000Z"
  },
  {
    id: "sample-4",
    folder: "Design",
    title: "Design Systems Need Governance, Not Just Components",
    content:
      "A design system succeeds when teams understand how decisions are made, how changes ship, and how quality is protected. Components matter, but governance turns them into a reliable product language.",
    created_at: "2026-04-20T09:45:00.000Z"
  },
  {
    id: "sample-5",
    folder: "Business",
    title: "The Case for Smaller Strategic Bets",
    content:
      "Smaller strategic bets help companies learn quickly without overcommitting. When each bet has a clear success signal, leaders can scale what works and retire what does not.",
    created_at: "2026-04-19T16:20:00.000Z"
  },
  {
    id: "sample-6",
    folder: "Engineering",
    title: "Why Internal Tools Deserve Product Thinking",
    content:
      "Internal tools shape how teams work every day. Treating them with product thinking improves adoption, reduces manual effort, and helps operations feel calmer and more predictable.",
    created_at: "2026-04-18T08:10:00.000Z"
  },
  {
    id: "sample-7",
    folder: "Tech Trends",
    title: "Data Privacy Is Becoming a Product Feature",
    content:
      "Privacy expectations are rising across every category. Products that explain data usage clearly and give users meaningful control can earn trust before competitors even start the conversation.",
    created_at: "2026-04-17T14:00:00.000Z"
  },
  {
    id: "sample-8",
    folder: "Marketing",
    title: "Newsletter Growth Starts With a Clear Reader Promise",
    content:
      "A newsletter grows when readers know exactly why it belongs in their inbox. The promise should be specific, repeatable, and valuable enough to make every send feel worthwhile.",
    created_at: "2026-04-16T12:00:00.000Z"
  }
];
