const express  = require("express");
const cron     = require("node-cron");
const fetch    = require("node-fetch");
const FormData = require("form-data");
const path     = require("path");
const { Pool } = require("pg");

const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "../miniapp/public")));

// ── ENV ───────────────────────────────────────────────────────
const BOT_TOKEN        = process.env.BOT_TOKEN;
const CHANNEL_ID       = process.env.CHANNEL_ID;
const KITCHEN_GROUP_ID = process.env.KITCHEN_GROUP_ID || "-5025106622";
const PORT             = process.env.PORT || 3000;

// ── DATABASE ──────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("railway") ? { rejectUnauthorized: false } : false,
});

// ── INIT TABLES ───────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL DEFAULT '',
      phone       TEXT DEFAULT '',
      address     TEXT DEFAULT '',
      kcal        TEXT DEFAULT '',
      price       TEXT DEFAULT '',
      notes       TEXT DEFAULT '',
      type        TEXT DEFAULT 'ration',
      status      TEXT DEFAULT 'активен',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS menu (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL DEFAULT '',
      cat         TEXT DEFAULT 'lunch',
      emoji       TEXT DEFAULT '🍽️',
      kcal        INTEGER DEFAULT 0,
      price       INTEGER DEFAULT 0,
      "desc"      TEXT DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id          TEXT PRIMARY KEY,
      client_name TEXT DEFAULT '',
      date        TEXT DEFAULT '',
      dish        TEXT DEFAULT '',
      qty         INTEGER DEFAULT 1,
      note        TEXT DEFAULT '',
      phone       TEXT DEFAULT '',
      status      TEXT DEFAULT 'new',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS posts (
      id            TEXT PRIMARY KEY,
      label         TEXT DEFAULT '',
      tag           TEXT DEFAULT '',
      text          TEXT DEFAULT '',
      photo_url     TEXT DEFAULT '',
      publish_date  TEXT DEFAULT '',
      publish_time  TEXT DEFAULT '',
      status        TEXT DEFAULT 'ready',
      posted_at     TEXT DEFAULT '',
      error         TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id          TEXT PRIMARY KEY,
      login       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      role        TEXT DEFAULT 'пользователь',
      client_id   TEXT DEFAULT '',
      token       TEXT DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS deposits (
      id          TEXT PRIMARY KEY,
      client_id   TEXT NOT NULL,
      amount      INTEGER NOT NULL DEFAULT 0,
      type        TEXT DEFAULT 'topup',
      note        TEXT DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("✅ Database tables ready");
}

// ── HELPERS ───────────────────────────────────────────────────
function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
function newToken() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}
function normalizeLogin(login) {
  return String(login || "").trim().toLowerCase();
}
function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice(7).trim();
}

async function ensureDefaultAccounts() {
  const { rows } = await pool.query("SELECT login FROM accounts WHERE login IN ('admin','cook')");
  const existing = rows.map(r => r.login);

  if (!existing.includes("admin")) {
    await pool.query(
      `INSERT INTO accounts (id, login, password, role, client_id, token, created_at)
       VALUES ($1, 'admin', 'Hgfd-32nJ', 'админ', '', '', NOW())`,
      [newId("acc")]
    );
  }
  if (!existing.includes("cook")) {
    await pool.query(
      `INSERT INTO accounts (id, login, password, role, client_id, token, created_at)
       VALUES ($1, 'cook', 'cook-1234', 'повар', '', '', NOW())`,
      [newId("acc")]
    );
  }
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
  try {
    const now      = new Date();
    const tashkent = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    const nowStr   = tashkent.toISOString().slice(0, 16);

    const { rows: readyPosts } = await pool.query(
      "SELECT * FROM posts WHERE status = 'ready'"
    );

    for (const post of readyPosts) {
      const scheduleStr = `${post.publish_date}T${post.publish_time}`;
      if (scheduleStr > nowStr) continue;

      try {
        await publishPost(post);
        await pool.query(
          "UPDATE posts SET status = 'posted', posted_at = $1, error = '' WHERE id = $2",
          [now.toISOString(), post.id]
        );
        console.log(`[OK] Published: ${post.label}`);
      } catch (err) {
        await pool.query(
          "UPDATE posts SET status = 'error', error = $1 WHERE id = $2",
          [err.message, post.id]
        );
        console.error(`[ERR] ${post.label}:`, err.message);
      }
    }
  } catch (e) {
    console.error("Cron error:", e.message);
  }
});

// ════════════════════════════════════════════════════════════════
// POSTS API
// ════════════════════════════════════════════════════════════════
app.get("/api/posts", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM posts ORDER BY publish_date, publish_time");
  res.json(rows);
});

app.post("/api/posts", async (req, res) => {
  const incoming = req.body;
  if (!Array.isArray(incoming)) return res.status(400).json({ error: "Expected array" });

  for (const p of incoming) {
    const id = p.id || newId("tg");
    await pool.query(
      `INSERT INTO posts (id, label, tag, text, photo_url, publish_date, publish_time, status, posted_at, error)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'','')`,
      [id, p.label||'', p.tag||'', p.text||'', p.photo_url||'', p.publish_date||'', p.publish_time||'', p.status||'ready']
    );
  }
  res.json({ ok: true, count: incoming.length });
});

app.post("/api/posts/:id/publish", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Post not found" });
  const post = rows[0];
  if (post.status === "posted") return res.status(400).json({ error: "Already posted" });

  try {
    await publishPost(post);
    await pool.query(
      "UPDATE posts SET status = 'posted', posted_at = $1, error = '' WHERE id = $2",
      [new Date().toISOString(), post.id]
    );
    res.json({ ok: true });
  } catch (err) {
    await pool.query(
      "UPDATE posts SET status = 'error', error = $1 WHERE id = $2",
      [err.message, post.id]
    );
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/posts/:id", async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (!keys.length) return res.json({ ok: true });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const vals = Object.values(fields);
  const { rowCount } = await pool.query(
    `UPDATE posts SET ${sets.join(", ")} WHERE id = $1`,
    [req.params.id, ...vals]
  );
  if (!rowCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.delete("/api/posts/:id", async (req, res) => {
  await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════════
// ORDERS API
// ════════════════════════════════════════════════════════════════
app.get("/api/orders", async (req, res) => {
  let q = "SELECT * FROM orders";
  const params = [];
  if (req.query.date) {
    q += " WHERE date = $1";
    params.push(req.query.date);
  }
  q += " ORDER BY created_at DESC";
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

app.post("/api/orders", async (req, res) => {
  const o  = req.body;
  const id = newId("ord");
  await pool.query(
    `INSERT INTO orders (id, client_name, date, dish, qty, note, phone, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
    [id, o.client_name||'', o.date||'', o.dish||'', o.qty||1, o.note||'', o.phone||'', o.status||'new']
  );
  res.json({ ok: true, order: { ...o, id, created_at: new Date().toISOString() } });
});

app.patch("/api/orders/:id", async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (!keys.length) return res.json({ ok: true });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const vals = Object.values(fields);
  const { rowCount } = await pool.query(
    `UPDATE orders SET ${sets.join(", ")} WHERE id = $1`,
    [req.params.id, ...vals]
  );
  if (!rowCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.delete("/api/orders/:id", async (req, res) => {
  await pool.query("DELETE FROM orders WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════════
// CLIENTS API
// ════════════════════════════════════════════════════════════════
app.get("/api/clients", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM clients ORDER BY created_at DESC");
  res.json(rows);
});

app.post("/api/clients", async (req, res) => {
  const b  = req.body;
  const id = newId("cl");
  await pool.query(
    `INSERT INTO clients (id, name, phone, address, kcal, price, notes, type, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
    [id, b.name||'', b.phone||'', b.address||'', b.kcal||'', b.price||'', b.notes||'', b.type||'ration', b.status||'активен']
  );
  res.json({ ok: true, client: { ...b, id, created_at: new Date().toISOString() } });
});

app.patch("/api/clients/:id", async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (!keys.length) return res.json({ ok: true });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const vals = Object.values(fields);
  const { rowCount } = await pool.query(
    `UPDATE clients SET ${sets.join(", ")} WHERE id = $1`,
    [req.params.id, ...vals]
  );
  if (!rowCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.delete("/api/clients/:id", async (req, res) => {
  await pool.query("DELETE FROM clients WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════════════════
// AUTH API
// ════════════════════════════════════════════════════════════════
app.post("/api/auth/register", async (req, res) => {
  const name     = String(req.body.name || "").trim();
  const phone    = String(req.body.phone || "").trim();
  const address  = String(req.body.address || "").trim();
  const login    = normalizeLogin(req.body.login);
  const password = String(req.body.password || "");

  if (!name || !phone || !address || !login || !password) {
    return res.status(400).json({ error: "Заполните все поля" });
  }

  const existing = await pool.query("SELECT id FROM accounts WHERE login = $1", [login]);
  if (existing.rows.length) {
    return res.status(400).json({ error: "Логин уже существует" });
  }

  const clientId = newId("cl");
  await pool.query(
    `INSERT INTO clients (id, name, phone, address, kcal, price, notes, type, status, created_at)
     VALUES ($1,$2,$3,$4,'','','','ration','активен',NOW())`,
    [clientId, name, phone, address]
  );

  const token = newToken();
  const accId = newId("acc");
  await pool.query(
    `INSERT INTO accounts (id, login, password, role, client_id, token, created_at)
     VALUES ($1,$2,$3,'пользователь',$4,$5,NOW())`,
    [accId, login, password, clientId, token]
  );

  res.json({
    ok: true,
    token,
    client: { id: clientId, name, phone, address, login, role: "пользователь" },
  });
});

app.post("/api/auth/login", async (req, res) => {
  const login    = normalizeLogin(req.body.login);
  const password = String(req.body.password || "");
  if (!login || !password) return res.status(400).json({ error: "Введите логин и пароль" });

  const { rows } = await pool.query(
    "SELECT * FROM accounts WHERE login = $1 AND password = $2",
    [login, password]
  );
  if (!rows.length) return res.status(401).json({ error: "Неверный логин или пароль" });

  const account = rows[0];
  const token   = newToken();
  await pool.query("UPDATE accounts SET token = $1 WHERE id = $2", [token, account.id]);

  let client = null;
  if (account.client_id) {
    const cr = await pool.query("SELECT * FROM clients WHERE id = $1", [account.client_id]);
    client = cr.rows[0] || null;
  }

  res.json({
    ok: true,
    token,
    client: {
      id:      client?.id || "",
      name:    client?.name || account.login,
      phone:   client?.phone || "",
      address: client?.address || "",
      login:   account.login,
      role:    account.role || "пользователь",
    },
  });
});

app.get("/api/auth/me", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: "Нет токена" });

  const { rows } = await pool.query("SELECT * FROM accounts WHERE token = $1", [token]);
  if (!rows.length) return res.status(401).json({ error: "Сессия недействительна" });

  const account = rows[0];
  let client = null;
  if (account.client_id) {
    const cr = await pool.query("SELECT * FROM clients WHERE id = $1", [account.client_id]);
    client = cr.rows[0] || null;
  }

  res.json({
    ok: true,
    client: {
      id:      client?.id || "",
      name:    client?.name || account.login,
      phone:   client?.phone || "",
      address: client?.address || "",
      login:   account.login,
      role:    account.role || "пользователь",
    },
  });
});

// ════════════════════════════════════════════════════════════════
// MENU API
// ════════════════════════════════════════════════════════════════
app.get("/api/menu", async (req, res) => {
  let q = "SELECT * FROM menu";
  const params = [];
  if (req.query.cat) {
    q += " WHERE cat = $1";
    params.push(req.query.cat);
  }
  q += " ORDER BY created_at DESC";
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

app.post("/api/menu", async (req, res) => {
  const b  = req.body;
  const id = newId("mn");
  await pool.query(
    `INSERT INTO menu (id, name, cat, emoji, kcal, price, "desc", created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
    [id, b.name||'', b.cat||'lunch', b.emoji||'🍽️', b.kcal||0, b.price||0, b.desc||'']
  );
  res.json({ ok: true, item: { ...b, id, created_at: new Date().toISOString() } });
});

app.patch("/api/menu/:id", async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (!keys.length) return res.json({ ok: true });
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`);
  const vals = Object.values(fields);
  const { rowCount } = await pool.query(
    `UPDATE menu SET ${sets.join(", ")} WHERE id = $1`,
    [req.params.id, ...vals]
  );
  if (!rowCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.delete("/api/menu/:id", async (req, res) => {
  await pool.query("DELETE FROM menu WHERE id = $1", [req.params.id]);
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
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected", time: new Date().toISOString() });
  } catch (e) {
    res.json({ ok: false, db: "error", error: e.message, time: new Date().toISOString() });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../miniapp/public/index.html"));
});

// ── START ─────────────────────────────────────────────────────
async function start() {
  try {
    await initDB();
    await ensureDefaultAccounts();
    app.listen(PORT, () => {
      console.log(`EAT & FIT server on port ${PORT}`);
      if (!BOT_TOKEN)  console.warn("⚠️  BOT_TOKEN not set!");
      if (!CHANNEL_ID) console.warn("⚠️  CHANNEL_ID not set!");
    });
  } catch (e) {
    console.error("❌ Failed to start:", e.message);
    process.exit(1);
  }
}

start();
