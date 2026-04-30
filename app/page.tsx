"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BlogPost,
  createSupabasePost,
  deleteSupabasePost,
  fetchSupabasePosts,
  supabaseConfigMessage,
  isSupabaseConfigured,
  updateSupabasePost
} from "@/lib/supabase";

const POSTS_PER_PAGE = 4;
const localStorageKey = "dart-hot-topics-posts";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"create" | "posts">("create");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [folder, setFolder] = useState("");
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginNotice, setLoginNotice] = useState("");

  const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME ?? "";
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";
  const requireAdminLogin = Boolean(adminUsername && adminPassword);

  const isEditing = Boolean(editingPostId);

  useEffect(() => {
    async function loadPosts() {
      if (isSupabaseConfigured) {
        try {
          const data = await fetchSupabasePosts();
          setPosts(data);
        } catch (error) {
          setPosts([]);
          setNotice(error instanceof Error ? error.message : "Could not load posts.");
        }
      } else {
        if (supabaseConfigMessage) {
          setNotice(supabaseConfigMessage);
        }
        const saved = window.localStorage.getItem(localStorageKey);
        const savedPosts = saved ? (JSON.parse(saved) as BlogPost[]) : [];
        const customPosts = savedPosts.filter(
          (post) => !post.id.startsWith("sample-")
        );
        setPosts(customPosts);
        window.localStorage.setItem(localStorageKey, JSON.stringify(customPosts));
      }

      setLoadingPosts(false);
    }

    loadPosts();
  }, []);

  useEffect(() => {
    if (!requireAdminLogin) {
      setAuthenticated(true);
    }
    setAuthChecked(true);
  }, [requireAdminLogin]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const filteredPosts = useMemo(() => {
    return filter === "All"
      ? posts
      : posts.filter((post) => post.folder === filter);
  }, [filter, posts]);

  const folderFilters = useMemo(() => {
    return Array.from(new Set(posts.map((post) => post.folder))).sort();
  }, [posts]);

  const totalPosts = posts.length;
  const totalDrafts = useMemo(
    () =>
      !isEditing &&
      (author.trim() || folder.trim() || title.trim() || content.trim())
        ? 1
        : 0,
    [author, content, folder, isEditing, title]
  );

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const visiblePosts = filteredPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function handleGenerate() {
    setGenerating(true);
    setNotice("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, folder })
      });
      const data = await response.json();
      setContent(data.content || "");
      setNotice(
        data.source === "claude"
          ? "Draft generated with Claude."
          : "Draft generated locally. Add ANTHROPIC_API_KEY for Claude."
      );
    } catch {
      setNotice("Could not generate content right now.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!author.trim() || !folder.trim() || !title.trim() || !content.trim()) {
      setNotice("Add an author, folder, title, and content before saving.");
      return;
    }

    setPublishing(true);
    setNotice("");

    const newPost = {
      author: author.trim(),
      folder: folder.trim(),
      title: title.trim(),
      content: content.trim()
    };

    if (isEditing && editingPostId) {
      try {
        if (isSupabaseConfigured) {
          const data = await updateSupabasePost(editingPostId, newPost);
          setPosts((current) =>
            current.map((post) => (post.id === editingPostId ? data : post))
          );
        } else {
          const nextPosts = posts.map((post) =>
            post.id === editingPostId ? { ...post, ...newPost } : post
          );
          setPosts(nextPosts);
          window.localStorage.setItem(localStorageKey, JSON.stringify(nextPosts));
        }
      } catch (error) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Update failed. Check your Supabase table and RLS policies."
        );
        setPublishing(false);
        return;
      }
    } else {
      if (isSupabaseConfigured) {
        try {
          const data = await createSupabasePost(newPost);
          setPosts((current) => [data, ...current]);
        } catch (error) {
          setNotice(
            error instanceof Error
              ? error.message
              : "Supabase publish failed. Check your table and RLS policies."
          );
          setPublishing(false);
          return;
        }
      } else {
        const localPost: BlogPost = {
          ...newPost,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        };
        const nextPosts = [localPost, ...posts];
        setPosts(nextPosts);
        window.localStorage.setItem(localStorageKey, JSON.stringify(nextPosts));
      }
    }

    resetEditor();
    setActiveTab("posts");
    setNotice(isEditing ? "Post updated." : "Post published.");
    setPublishing(false);
  }

  function startEditing(post: BlogPost) {
    setEditingPostId(post.id);
    setAuthor(post.author ?? "");
    setFolder(post.folder);
    setTitle(post.title);
    setContent(post.content);
    setNotice("");
    setActiveTab("create");
  }

  function resetEditor() {
    setEditingPostId(null);
    setAuthor("");
    setFolder("");
    setTitle("");
    setContent("");
  }

  function handleLogout() {
    setAuthenticated(false);
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginNotice("");

    if (!adminUsername || !adminPassword) {
      setLoginNotice(
        "Admin login is not configured. Set NEXT_PUBLIC_ADMIN_USERNAME and NEXT_PUBLIC_ADMIN_PASSWORD."
      );
      return;
    }

    if (
      loginUsername.trim() === adminUsername &&
      loginPassword.trim() === adminPassword
    ) {
      setAuthenticated(true);
      setLoginUsername("");
      setLoginPassword("");
      setLoginNotice("");
      return;
    }

    setLoginNotice("Incorrect username or password.");
  }

  async function handleDelete(post: BlogPost) {
    const confirmed = window.confirm(`Delete "${post.title}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingPostId(post.id);
    setNotice("");

    try {
      if (isSupabaseConfigured) {
        await deleteSupabasePost(post.id);
      }

      const nextPosts = posts.filter((item) => item.id !== post.id);
      setPosts(nextPosts);

      if (!isSupabaseConfigured) {
        window.localStorage.setItem(localStorageKey, JSON.stringify(nextPosts));
      }

      if (editingPostId === post.id) {
        resetEditor();
      }

      setNotice("Post deleted.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Delete failed. Check your Supabase table and RLS policies."
      );
    } finally {
      setDeletingPostId(null);
    }
  }

  if (!authChecked) {
    return null;
  }

  if (!authenticated && requireAdminLogin) {
    return (
      <main className="shell">
        <section className="topbar">
          <div>
            <h3>ডার্ট ডকুমেন্টেশন</h3>
          </div>
        </section>

        {loginNotice ? <p className="notice">{loginNotice}</p> : null}

        <section className="panel">
          <form className="editor" onSubmit={handleLogin}>
            <label>
              Username
              <input
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
                placeholder="Admin username"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Admin password"
              />
            </label>

            <button className="publish" type="submit">
              Sign In
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div className="topbarHeader">
          <div>
            <h3>ডার্ট ডকুমেন্টেশন</h3>
          </div>
          <div className="statusRow">
            {requireAdminLogin ? (
              <button className="logoutButton" type="button" onClick={handleLogout}>
                Logout
              </button>
            ) : null}
          </div>
        </div>

        <div className="statsRow">
          <div className="statCard">
            <span className="statLabel">Total posts</span>
            <strong className="statValue">{totalPosts}</strong>
          </div>
          <div className="statCard">
            <span className="statLabel">Total drafts</span>
            <strong className="statValue">{totalDrafts}</strong>
          </div>
        </div>
      </section>

      <nav className="tabs" aria-label="Portal tabs">
        <button
          className={activeTab === "create" ? "active" : ""}
          onClick={() => setActiveTab("create")}
        >
          {isEditing ? "Edit" : "Create"}
        </button>
        <button
          className={activeTab === "posts" ? "active" : ""}
          onClick={() => setActiveTab("posts")}
        >
          All Posts
        </button>
      </nav>

      {notice ? <p className="notice">{notice}</p> : null}

      {activeTab === "create" ? (
        <section className="panel">
          <form className="editor" onSubmit={handleSave}>
            <div className="formHeader">
              <h2>{isEditing ? "Edit post" : "Create post"}</h2>
              {isEditing ? (
                <button type="button" className="ghostButton" onClick={resetEditor}>
                  Cancel edit
                </button>
              ) : null}
            </div>

            <label>
              Folder
              <div className="folderField">
                <input
                  value={folder}
                  onChange={(event) => setFolder(event.target.value)}
                  placeholder="Type a custom folder name"
                  list={folderFilters.length > 0 ? "folder-options" : undefined}
                />
                {folderFilters.length > 0 ? (
                  <>
                    <datalist id="folder-options">
                      {folderFilters.map((item) => (
                        <option value={item} key={item} />
                      ))}
                    </datalist>
                    <select
                      value=""
                      onChange={(event) => setFolder(event.target.value)}
                      aria-label="Choose existing folder"
                    >
                      <option value="" disabled>
                        Existing folders
                      </option>
                      {folderFilters.map((item) => (
                        <option value={item} key={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}
              </div>
            </label>

            <label>
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Write a title for your post"
              />
            </label>

            <label>
              Author
              <input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Enter author name"
              />
            </label>
            <label>
              Content
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing, or generate a draft from the title."
              />
            </label>

            <button className="publish" disabled={publishing}>
              {publishing
                ? isEditing
                  ? "Updating..."
                  : "Publishing..."
                : isEditing
                  ? "Update Post"
                  : "Publish Post"}
            </button>
          </form>
        </section>
      ) : (
        <section className="postsPanel">
          <div className="filters" aria-label="Folder filters">
            {["All", ...folderFilters].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loadingPosts ? (
            <p className="empty">Loading posts...</p>
          ) : visiblePosts.length === 0 ? (
            <p className="empty">No posts in this folder yet.</p>
          ) : (
            <div className="postGrid">
              {visiblePosts.map((post) => (
                <article className="postCard" key={post.id}>
                  <div className="metaRow">
                    <span className="badge">{post.folder}</span>
                    {post.author ? <span className="author">by {post.author}</span> : null}
                    <time>{formatDate(post.created_at)}</time>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{truncate(post.content)}</p>
                  <div className="cardActions">
                    <button onClick={() => startEditing(post)}>Edit</button>
                    <button
                      className="dangerButton"
                      onClick={() => handleDelete(post)}
                      disabled={deletingPostId === post.id}
                    >
                      {deletingPostId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="pagination">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function truncate(content: string) {
  return content.length > 170 ? `${content.slice(0, 170).trim()}...` : content;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}
