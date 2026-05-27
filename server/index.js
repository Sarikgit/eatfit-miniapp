const express  = require("express");
const cron     = require("node-cron");
const fetch    = require("node-fetch");
const FormData = require("form-data");
const path     = require("path");
const fs       = require("fs");

const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "../miniapp/public")));

// ── ENV ───────────────────────────────────────────────────────
const BOT_TOKEN        = process.env.BOT_TOKEN;
const CHANNEL_ID       = process.env.CHANNEL_ID;
const KITCHEN_GROUP_ID = process.env.KITCHEN_GROUP_ID || "-5025106622";
const PORT             = process.env.PORT || 3000;

// ── DATA FILES ────────────────────────────────────────────────
const DATA_DIR     = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const POSTS_FILE   = path.join(DATA_DIR, "posts.json");
const ORDERS_FILE  = path.join(DATA_DIR, "orders.json");
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json");
const MENU_FILE    = path.join(DATA_DIR, "menu.json");

// ── GENERIC JSON HELPERS ──────────────────────────────────────
function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return []; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// shortcuts
const loadPosts   = ()        => readJSON(POSTS_FILE);
const savePosts   = (d)       => writeJSON(POSTS_FILE, d);
const loadOrders  = ()        => readJSON(ORDERS_FILE);
const saveOrders  = (d)       => writeJSON(ORDERS_FILE, d);
const loadClients = ()        => readJSON(CLIENTS_FILE);
const saveClients = (d)       => writeJSON(CLIENTS_FILE, d);
const loadMenu    = ()        => readJSON(MENU_FILE);
const saveMenu    = (d)       => writeJSON(MENU_FILE, d);

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ── TELEGRAM HELPERS ──────────────────────────────────────────
async function sendTelegramPhoto(chatId, photoUrl, caption) {
  const imgRes = await fetch(photoUrl);
  if (!imgRes.ok) throw new Error("Не удалось загрузить фото");
  const imgBuffer   = await imgRes.buffer();
  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  const ext         = contentType.includes("png") ? "png" : "jpg";
  const form        = new FormData();
  form.append("chat_id",    chatId);
  form.append("caption",    caption);
  form.append("parse_mode", "HTML");
  form.append("photo",      imgBuffer, { filename: `photo.${ext}`, contentType });
  const res  = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: "POST", body: form, headers: form.getHeaders(),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description);
  return data;
}

async function sendTelegramMessage(chatId, text) {
  const res  = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description);
  return data;
}

async function publishPost(post) {
  if (post.photo_url && post.photo_url.trim()) {
    return await sendTelegramPhoto(CHANNEL_ID, post.photo_url.trim(), post.text);
  }
  return await sendTelegramMessage(CHANNEL_ID, post.text);
}

// ── CRON: auto-publish ────────────────────────────────────────
cron.schedule("* * * * *", async () => {
  const posts   = loadPosts();
  const now     = new Date();
  const tashkent = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const nowStr  = tashkent.toISOString().slice(0, 16);
  let changed   = false;

  for (const post of posts) {
    if (post.status !== "ready") continue;
    if (`${post.publish_date}T${post.publish_time}` > nowStr) continue;
    try {
      await publishPost(post);
      post.status    = "posted";
      post.posted_at = now.toISOString();
      post.error     = "";
      console.log(`[OK] Published: ${post.label}`);
    } catch (err) {
      post.status = "error";
      post.error  = err.message;
      console.error(`[ERR] ${post.label}:`, err.message);
    }
    changed = true;
  }
  if (changed) savePosts(posts);
});

// ════════════════════════════════════════════════════════════════
// POSTS API
// ════════════════════════════════════════════════════════════════
app.get("/api/posts", (req, res) => res.json(loadPosts()));

app.post("/api/posts", (req, res) => {
  const incoming = req.body;
  if (!Array.isArray(incoming)) return res.status(400).json({ error: "Expected array" });
  const posts = loadPosts();
  for (const p of incoming) {
    p.id        = p.id || newId("tg");
    p.status    = p.status || "ready";
    p.posted_at = "";
    p.error     = "";
    posts.push(p);
  }
  savePosts(posts);
  res.json({ ok: true, count: incoming.length });
});

app.post("/api/posts/:id/publish", async (req, res) => {
  const posts = loadPosts();
  const post  = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.status === "posted") return res.status(400).json({ error: "Already posted" });
  try {
    await publishPost(post);
    post.status    = "posted";
    post.posted_at = new Date().toISOString();
    post.error     = "";
    savePosts(posts);
    res.json({ ok: true });
  } catch (err) {
    post.status = "error";
    post.error  = err.message;
    savePosts(posts);
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/posts/:id", (req, res) => {
  const posts = loadPosts();
  const post  = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Not found" });
  Object.assign(post, req.body);
  savePosts(posts);
  res.json({ ok: true, post });
});

app.delete("/api/posts/:id", (req, res) => {
  savePosts(loadPosts().filter(p => p.id !== req.params.id));
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════════
// ORDERS API
// ════════════════════════════════════════════════════════════════
app.get("/api/orders", (req, res) => {
  let orders = loadOrders();
  if (req.query.date) orders = orders.filter(o => o.date === req.query.date);
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const orders = loadOrders();
  const o      = { ...req.body, id: newId("ord"), created_at: new Date().toISOString(), status: req.body.status || "new" };
  orders.push(o);
  saveOrders(orders);
  res.json({ ok: true, order: o });
});

app.patch("/api/orders/:id", (req, res) => {
  const orders = loadOrders();
  const o      = orders.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: "Not found" });
  Object.assign(o, req.body);
  saveOrders(orders);
  res.json({ ok: true, order: o });
});

app.delete("/api/orders/:id", (req, res) => {
  saveOrders(loadOrders().filter(x => x.id !== req.params.id));
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════════
// CLIENTS API
// ════════════════════════════════════════════════════════════════
app.get("/api/clients", (req, res) => {
  res.json(loadClients());
});

app.post("/api/clients", (req, res) => {
  const clients = loadClients();
  const c = {
    id:         newId("cl"),
    name:       req.body.name    || "",
    phone:      req.body.phone   || "",
    address:    req.body.address || "",
    kcal:       req.body.kcal    || "",
    price:      req.body.price   || "",
    notes:      req.body.notes   || "",
    type:       req.body.type    || "ration",   // "ration" | "lunch"
    status:     req.body.status  || "активен",  // "активен" | "пауза"
    created_at: new Date().toISOString(),
  };
  clients.push(c);
  saveClients(clients);
  res.json({ ok: true, client: c });
});

app.patch("/api/clients/:id", (req, res) => {
  const clients = loadClients();
  const c       = clients.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Not found" });
  Object.assign(c, req.body);
  saveClients(clients);
  res.json({ ok: true, client: c });
});

app.delete("/api/clients/:id", (req, res) => {
  saveClients(loadClients().filter(x => x.id !== req.params.id));
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════════
// MENU API
// ════════════════════════════════════════════════════════════════
app.get("/api/menu", (req, res) => {
  let items = loadMenu();
  if (req.query.cat) items = items.filter(m => m.cat === req.query.cat);
  res.json(items);
});

app.post("/api/menu", (req, res) => {
  const menu = loadMenu();
  const item = {
    id:    newId("mn"),
    name:  req.body.name  || "",
    cat:   req.body.cat   || "lunch",  // breakfast | lunch | dinner | snack
    emoji: req.body.emoji || "🍽️",
    kcal:  req.body.kcal  || 0,
    price: req.body.price || 0,
    desc:  req.body.desc  || "",
    created_at: new Date().toISOString(),
  };
  menu.push(item);
  saveMenu(menu);
  res.json({ ok: true, item });
});

app.patch("/api/menu/:id", (req, res) => {
  const menu = loadMenu();
  const item = menu.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  Object.assign(item, req.body);
  saveMenu(menu);
  res.json({ ok: true, item });
});

app.delete("/api/menu/:id", (req, res) => {
  saveMenu(loadMenu().filter(m => m.id !== req.params.id));
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════════
// KITCHEN API
// ════════════════════════════════════════════════════════════════
app.post("/api/kitchen/send", async (req, res) => {
  const { date, orders, ration_clients } = req.body;
  const d      = new Date(date);
  const months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  const dateStr = `${d.getDate()} ${months[d.getMonth()]}`;

  let msg = `🍳 <b>КУХОННЫЙ ЛИСТ — ${dateStr}</b>\n━━━━━━━━━━━━━━━━━━━\n\n`;

  if (ration_clients?.length) {
    msg += `📋 <b>РАЦИОНЫ (${ration_clients.length} чел.)</b>\n\n`;
    ration_clients.forEach((c, i) => {
      msg += `${i + 1}. <b>${c.name}</b> — ${c.kcal} ккал`;
      const comment = c.kitchen || c.notes || "";
      if (comment) msg += `\n    ⚠️ ${comment}`;
      msg += `\n`;
    });
    const totalKcal = ration_clients.reduce((s, c) => s + (parseInt(c.kcal) || 0), 0);
    msg += `\n📊 Итого: ${ration_clients.length} чел. | ${totalKcal} ккал\n`;
  }

  if (orders?.length) {
    msg += `\n━━━━━━━━━━━━━━━━━━━\n🍱 <b>ОБЕДЫ</b>\n\n`;
    const counts = {};
    orders.forEach(o => { counts[o.dish] = (counts[o.dish] || 0) + parseInt(o.qty || 1); });
    Object.entries(counts).forEach(([dish, qty]) => { msg += `• ${dish} — <b>${qty} порц.</b>\n`; });
    msg += `\n👤 Клиенты:\n`;
    orders.forEach((o, i) => {
      msg += `${i + 1}. ${o.client_name} — ${o.dish} x${o.qty || 1}`;
      if (o.note) msg += ` (${o.note})`;
      msg += `\n`;
    });
  }

  if (!ration_clients?.length && !orders?.length) {
    return res.status(400).json({ error: "Нет данных для отправки" });
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━\n⏰ Доставка: 10:00 – 12:00`;

  try {
    await sendTelegramMessage(KITCHEN_GROUP_ID, msg);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════════════
// MISC
// ════════════════════════════════════════════════════════════════
app.get("/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// fallback — отдаём index.html для всех не-API маршрутов
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../miniapp/public/index.html"));
});

app.listen(PORT, () => {
  console.log(`EAT & FIT server on port ${PORT}`);
  if (!BOT_TOKEN)  console.warn("⚠️  BOT_TOKEN not set!");
  if (!CHANNEL_ID) console.warn("⚠️  CHANNEL_ID not set!");
});
