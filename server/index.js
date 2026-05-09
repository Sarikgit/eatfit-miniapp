const express = require("express");
const cron = require("node-cron");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../miniapp/public")));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PORT = process.env.PORT || 3000;

const DB_FILE = path.join(__dirname, "posts.json");

// ─── Simple JSON storage ───────────────────────────────────────────────────

function loadPosts() {
  if (!fs.existsSync(DB_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return []; }
}

function savePosts(posts) {
  fs.writeFileSync(DB_FILE, JSON.stringify(posts, null, 2));
}

// ─── Telegram API ──────────────────────────────────────────────────────────

async function sendTelegramPhoto(photoUrl, caption) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      photo: photoUrl,
      caption: caption,
      parse_mode: "HTML",
    }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description);
  return data;
}

async function sendTelegramMessage(text) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text: text,
      parse_mode: "HTML",
    }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description);
  return data;
}

async function publishPost(post) {
  if (post.photo_url && post.photo_url.trim()) {
    return await sendTelegramPhoto(post.photo_url.trim(), post.text);
  } else {
    return await sendTelegramMessage(post.text);
  }
}

// ─── Scheduler — runs every minute ────────────────────────────────────────

cron.schedule("* * * * *", async () => {
  const posts = loadPosts();
  const now = new Date();
  const nowStr = now.toISOString().slice(0, 16); // "2025-05-15T15:00"
  let changed = false;

  for (const post of posts) {
    if (post.status !== "ready") continue;
    const scheduleStr = `${post.publish_date}T${post.publish_time}`;
    if (scheduleStr > nowStr) continue;

    try {
      await publishPost(post);
      post.status = "posted";
      post.posted_at = now.toISOString();
      post.error = "";
      console.log(`[OK] Published: ${post.label} at ${now.toISOString()}`);
    } catch (err) {
      post.status = "error";
      post.error = err.message;
      console.error(`[ERR] ${post.label}:`, err.message);
    }
    changed = true;
  }

  if (changed) savePosts(posts);
});

// ─── API Routes ────────────────────────────────────────────────────────────

// Get all posts
app.get("/api/posts", (req, res) => {
  res.json(loadPosts());
});

// Save posts batch (from Mini App "queue day")
app.post("/api/posts", (req, res) => {
  const incoming = req.body;
  if (!Array.isArray(incoming)) return res.status(400).json({ error: "Expected array" });

  const posts = loadPosts();
  for (const p of incoming) {
    if (!p.id) p.id = `tg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    p.status = p.status || "ready";
    p.posted_at = "";
    p.error = "";
    posts.push(p);
  }
  savePosts(posts);
  res.json({ ok: true, count: incoming.length });
});

// Publish one post immediately
app.post("/api/posts/:id/publish", async (req, res) => {
  const posts = loadPosts();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.status === "posted") return res.status(400).json({ error: "Already posted" });

  try {
    await publishPost(post);
    post.status = "posted";
    post.posted_at = new Date().toISOString();
    post.error = "";
    savePosts(posts);
    res.json({ ok: true });
  } catch (err) {
    post.status = "error";
    post.error = err.message;
    savePosts(posts);
    res.status(500).json({ error: err.message });
  }
});

// Delete post
app.delete("/api/posts/:id", (req, res) => {
  let posts = loadPosts();
  posts = posts.filter(p => p.id !== req.params.id);
  savePosts(posts);
  res.json({ ok: true });
});

// Update post status to ready/draft
app.patch("/api/posts/:id", (req, res) => {
  const posts = loadPosts();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Not found" });
  Object.assign(post, req.body);
  savePosts(posts);
  res.json({ ok: true, post });
});

// Health check
app.get("/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Serve Mini App for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../miniapp/public/index.html"));
});

app.listen(PORT, () => {
  console.log(`EAT & FIT Mini App server running on port ${PORT}`);
  if (!BOT_TOKEN) console.warn("⚠️  BOT_TOKEN not set!");
  if (!CHANNEL_ID) console.warn("⚠️  CHANNEL_ID not set!");
});
