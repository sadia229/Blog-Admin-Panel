export type BlogPost = {
  id: string;
  author?: string;
  folder: string;
  title: string;
  content: string;
  created_at: string;
};

export type BlogPostInput = Pick<BlogPost, "author" | "folder" | "title" | "content">;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const cleanSupabaseUrl = supabaseUrl?.trim();
const cleanSupabaseAnonKey = supabaseAnonKey?.trim();

export const supabaseConfigMessage = getSupabaseConfigMessage();
export const isSupabaseConfigured = !supabaseConfigMessage;

export async function fetchSupabasePosts() {
  if (!isSupabaseConfigured) {
    return [];
  }

  const response = await fetch(
    `${cleanSupabaseUrl}/rest/v1/posts?select=*&order=created_at.desc`,
    {
      headers: supabaseHeaders()
    }
  );

  if (!response.ok) {
    throw new Error(await formatSupabaseError(response, "load posts"));
  }

  return (await response.json()) as BlogPost[];
}

export async function createSupabasePost(post: BlogPostInput) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${cleanSupabaseUrl}/rest/v1/posts`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      "content-type": "application/json",
      prefer: "return=representation"
    },
    body: JSON.stringify(post)
  });

  if (!response.ok) {
    throw new Error(await formatSupabaseError(response, "publish post"));
  }

  const data = (await response.json()) as BlogPost[];
  return data[0];
}

export async function updateSupabasePost(id: string, post: BlogPostInput) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(
    `${cleanSupabaseUrl}/rest/v1/posts?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseHeaders(),
        "content-type": "application/json",
        prefer: "return=representation"
      },
      body: JSON.stringify(post)
    }
  );

  if (!response.ok) {
    throw new Error(await formatSupabaseError(response, "update post"));
  }

  const data = (await response.json()) as BlogPost[];
  return data[0];
}

export async function deleteSupabasePost(id: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(
    `${cleanSupabaseUrl}/rest/v1/posts?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: supabaseHeaders()
    }
  );

  if (!response.ok) {
    throw new Error(await formatSupabaseError(response, "delete post"));
  }
}

async function formatSupabaseError(response: Response, action: string) {
  const text = await response.text();

  try {
    const data = JSON.parse(text);
    return `Could not ${action}: ${data.message || response.statusText}`;
  } catch {
    return `Could not ${action}: ${response.status} ${response.statusText}`;
  }
}

function supabaseHeaders() {
  return {
    apikey: cleanSupabaseAnonKey as string,
    authorization: `Bearer ${cleanSupabaseAnonKey}`
  };
}

function getSupabaseConfigMessage() {
  if (!cleanSupabaseUrl || !cleanSupabaseAnonKey) {
    return "Supabase is not configured. Add URL and anon key in .env.local.";
  }

  if (
    cleanSupabaseUrl.includes("your-") ||
    cleanSupabaseAnonKey.includes("your-")
  ) {
    return "Supabase env values are placeholders. Replace them with real project values.";
  }

  if (!/^https:\/\/[^.]+\.supabase\.co$/.test(cleanSupabaseUrl)) {
    return "Supabase URL should look like https://project-ref.supabase.co.";
  }

  if (
    !cleanSupabaseAnonKey.startsWith("eyJ") &&
    !cleanSupabaseAnonKey.startsWith("sb_publishable_")
  ) {
    return "Supabase key should be an anon JWT or publishable key from your project.";
  }

  return "";
}
