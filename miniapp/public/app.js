const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

let currentQty = 1;
let kitchenData = { ration: [], orders: [] };
let currentMenuFilter = "";
const HISTORY_KEY = "eatfit_dish_history";
const IMGBB_KEY = "2c809fab10891ae2d68a20d3e5f4350b";

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  document.getElementById("pub-date").value = tomorrow;
  document.getElementById("o-date").value = tomorrow;
  document.getElementById("o-filter-date").value = today;
  document.getElementById("k-date").value = today;

  renderDishHistory();
  loadOrdersList();
  loadKitchen();
});

function showTab(name, tabEl) {
  if (name === "deposits") loadDepositClients();
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");
  tabEl.classList.add("active");

  if (name === "queue") loadQueue();
  if (name === "history") loadHistory();
  if (name === "orders") loadOrdersList();
  if (name === "kitchen") loadKitchen();
  if (name === "clients") loadClientsList();
  if (name === "menu") loadMenuList();
}

function changeQty(d) {
  currentQty = Math.max(1, currentQty + d);
  document.getElementById("qty-val").textContent = currentQty;
}

async function addOrder() {
  const name = document.getElementById("o-name").value.trim();
  const date = document.getElementById("o-date").value;
  const dish = document.getElementById("o-dish").value;
  const note = document.getElementById("o-note").value.trim();
  const phone = document.getElementById("o-phone").value.trim();
  if (!name || !date) return toast("Укажите имя и дату ⚠️");

  const r = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_name: name, date, dish, qty: currentQty, note, phone, status: "new" }),
  });
  const data = await r.json();
  if (!data.ok) return toast("Ошибка: " + data.error);

  toast("✅ Заказ добавлен!");
  document.getElementById("o-name").value = "";
  document.getElementById("o-note").value = "";
  document.getElementById("o-phone").value = "";
  currentQty = 1;
  document.getElementById("qty-val").textContent = "1";
  loadOrdersList();
}

async function loadOrdersList() {
  const dateFilter = document.getElementById("o-filter-date").value;
  const url = dateFilter ? `/api/orders?date=${dateFilter}` : "/api/orders";
  const el = document.getElementById("orders-list");
  el.innerHTML = '<div class="empty"><div class="empty-icon">⏳</div></div>';
  try {
    const r = await fetch(url);
    const orders = await r.json();
    if (!orders.length) {
      el.innerHTML = '<div class="empty"><div class="empty-icon">📭</div><div class="empty-text">Нет заказов</div></div>';
      return;
    }
    el.innerHTML = orders.sort((a, b) => b.created_at.localeCompare(a.created_at)).map(renderOrderItem).join("");
  } catch {
    el.innerHTML = '<div class="empty"><div class="empty-text">Ошибка загрузки</div></div>';
  }
}

function clearOrderFilter() {
  document.getElementById("o-filter-date").value = "";
  loadOrdersList();
}

function renderOrderItem(o) {
  const statusMap = { new: "🆕 Новый", cooking: "👨‍🍳 Готовится", done: "✅ Готово", delivered: "🚗 Доставлен" };
  const statusCls = { new: "st-new", cooking: "st-cooking", done: "st-done", delivered: "st-delivered" };
  return `<div class="order-item">
    <div class="order-header">
      <div class="order-body" style="flex:1">
        <div class="order-name">${o.client_name || "-"}</div>
        <div class="order-dish">${o.dish || "-"} × ${o.qty || 1}</div>
      </div>
      <span class="status-badge ${statusCls[o.status] || "st-new"}">${statusMap[o.status] || o.status}</span>
    </div>
    <div class="order-body">
      <div class="order-meta">
        <span>📅 ${o.date || "-"}</span>
        ${o.phone ? `<span>📞 ${o.phone}</span>` : ""}
      </div>
      ${o.note ? `<div class="order-note">⚠️ ${o.note}</div>` : ""}
      <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" onclick="updateOrderStatus('${o.id}','cooking')">👨‍🍳 Готовится</button>
        <button class="btn btn-primary btn-sm" onclick="updateOrderStatus('${o.id}','done')">✅ Готово</button>
        <button class="btn btn-secondary btn-sm" onclick="updateOrderStatus('${o.id}','delivered')">🚗 Доставлен</button>
        <button class="btn btn-danger btn-sm" onclick="deleteOrder('${o.id}')">🗑</button>
      </div>
    </div>
  </div>`;
}

async function updateOrderStatus(id, status) {
  await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  loadOrdersList();
  toast("Статус обновлён");
}

async function deleteOrder(id) {
  if (!confirm("Удалить заказ?")) return;
  await fetch(`/api/orders/${id}`, { method: "DELETE" });
  loadOrdersList();
  toast("Удалено");
}

async function addClient() {
  const payload = {
    name: document.getElementById("cl-name").value.trim(),
    phone: document.getElementById("cl-phone").value.trim(),
    address: document.getElementById("cl-address").value.trim(),
    type: document.getElementById("cl-type").value,
    kcal: document.getElementById("cl-kcal").value.trim(),
    price: document.getElementById("cl-price").value.trim(),
    notes: document.getElementById("cl-comment").value.trim(),
    status: document.getElementById("cl-status").value,
  };
  if (!payload.name || !payload.phone || !payload.address) return toast("Введите имя, телефон и адрес ⚠️");

  const r = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  if (!data.ok) return toast("Ошибка: " + data.error);

  ["cl-name", "cl-phone", "cl-address", "cl-kcal", "cl-price", "cl-comment"].forEach((id) => (document.getElementById(id).value = ""));
  document.getElementById("cl-type").value = "ration";
  document.getElementById("cl-status").value = "активен";
  toast("✅ Клиент добавлен");
  loadClientsList();
}

async function loadClientsList() {
  const el = document.getElementById("clients-list");
  const search = (document.getElementById("clients-search").value || "").toLowerCase().trim();
  el.innerHTML = '<div class="empty"><div class="empty-icon">⏳</div></div>';

  try {
    const r = await fetch("/api/clients");
    let clients = await r.json();
    if (search) clients = clients.filter((c) => `${c.name} ${c.phone} ${c.address}`.toLowerCase().includes(search));

    if (!clients.length) {
      el.innerHTML = '<div class="empty"><div class="empty-icon">👥</div><div class="empty-text">Клиенты не найдены</div></div>';
      return;
    }

    el.innerHTML = clients
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .map((c) => {
        const initials = (c.name || "?").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
        const typeLabel = c.type === "lunch" ? "🍱 Ланч" : "🥗 Рацион";
        const statusClass = c.status === "активен" ? "st-done" : "st-pause";
        const statusLabel = c.status === "активен" ? "✅ Активен" : "⏸ Пауза";
        return `<div class="client-card">
          <div class="client-header">
            <div class="client-avatar">${initials}</div>
            <div style="flex:1">
              <div class="client-name-big">${c.name || "-"}</div>
              <div class="client-info-row">
                <span>📞 ${c.phone || "-"}</span>
                <span>📍 ${c.address || "-"}</span>
              </div>
            </div>
            <span class="status-badge ${statusClass}">${statusLabel}</span>
          </div>
          <div class="order-body">
            <div class="menu-pills">
              <span class="menu-pill pill-cat">${typeLabel}</span>
              ${c.kcal ? `<span class="menu-pill pill-kcal">${c.kcal} ккал</span>` : ""}
              ${c.price ? `<span class="menu-pill pill-price">${Number(c.price).toLocaleString("ru")} сум</span>` : ""}
            </div>
            ${c.notes ? `<div class="order-note" style="margin-top:8px">⚠️ ${c.notes}</div>` : ""}
            <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
              <button class="btn btn-secondary btn-sm" onclick="toggleClientStatus('${c.id}', '${c.status}')">${c.status === "активен" ? "⏸ Пауза" : "▶️ Активировать"}</button>
              <button class="btn btn-danger btn-sm" onclick="deleteClient('${c.id}')">🗑</button>
            </div>
          </div>
        </div>`;
      })
      .join("");
  } catch (e) {
    el.innerHTML = `<div class="empty"><div class="empty-text">Ошибка: ${e.message}</div></div>`;
  }
}

async function toggleClientStatus(id, currentStatus) {
  const status = currentStatus === "активен" ? "пауза" : "активен";
  await fetch(`/api/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  loadClientsList();
  toast("Статус клиента обновлён");
}

async function deleteClient(id) {
  if (!confirm("Удалить клиента?")) return;
  await fetch(`/api/clients/${id}`, { method: "DELETE" });
  loadClientsList();
  toast("Клиент удалён");
}

function setMenuFilter(cat, btn) {
  currentMenuFilter = cat;
  document.querySelectorAll(".cat-pill").forEach((x) => x.classList.remove("active"));
  btn.classList.add("active");
  loadMenuList();
}

async function addMenuItem() {
  const payload = {
    name: document.getElementById("m-name").value.trim(),
    emoji: document.getElementById("m-emoji").value.trim() || "🍽️",
    cat: document.getElementById("m-cat").value,
    kcal: Number(document.getElementById("m-kcal").value || 0),
    price: Number(document.getElementById("m-price").value || 0),
    desc: document.getElementById("m-desc").value.trim(),
  };
  if (!payload.name || !payload.kcal || !payload.price) return toast("Заполните название, ккал и цену ⚠️");

  const r = await fetch("/api/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  if (!data.ok) return toast("Ошибка: " + data.error);

  ["m-name", "m-emoji", "m-kcal", "m-price", "m-desc"].forEach((id) => (document.getElementById(id).value = ""));
  document.getElementById("m-cat").value = "lunch";
  toast("✅ Блюдо добавлено");
  loadMenuList();
}

async function loadMenuList() {
  const el = document.getElementById("menu-list");
  el.innerHTML = '<div class="empty"><div class="empty-icon">⏳</div></div>';
  const url = currentMenuFilter ? `/api/menu?cat=${encodeURIComponent(currentMenuFilter)}` : "/api/menu";
  try {
    const r = await fetch(url);
    const items = await r.json();
    if (!items.length) {
      el.innerHTML = '<div class="empty"><div class="empty-icon">🍽</div><div class="empty-text">Меню пустое</div></div>';
      return;
    }
    const cats = { breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Полдник" };
    el.innerHTML = items
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .map((m) => `<div class="menu-card">
        <div class="menu-card-header">
          <div class="menu-emoji">${m.emoji || "🍽️"}</div>
          <div class="menu-card-name">${m.name || "-"}</div>
          <button class="btn btn-danger btn-sm" onclick="deleteMenuItem('${m.id}')">🗑</button>
        </div>
        <div class="menu-card-body">
          <div class="menu-card-desc">${m.desc || "Без описания"}</div>
          <div class="menu-pills">
            <span class="menu-pill pill-kcal">${m.kcal || 0} ккал</span>
            <span class="menu-pill pill-price">${Number(m.price || 0).toLocaleString("ru")} сум</span>
            <span class="menu-pill pill-cat">${cats[m.cat] || m.cat}</span>
          </div>
        </div>
      </div>`)
      .join("");
  } catch (e) {
    el.innerHTML = `<div class="empty"><div class="empty-text">Ошибка: ${e.message}</div></div>`;
  }
}

async function deleteMenuItem(id) {
  if (!confirm("Удалить блюдо?")) return;
  await fetch(`/api/menu/${id}`, { method: "DELETE" });
  loadMenuList();
  toast("Позиция удалена");
}

async function registerClient() {
  const successEl = document.getElementById("register-success");
  const errorEl = document.getElementById("register-error");
  successEl.classList.remove("show");
  errorEl.classList.remove("show");

  const name = document.getElementById("r-name").value.trim();
  const phone = document.getElementById("r-phone").value.trim();
  const address = document.getElementById("r-address").value.trim();
  const type = document.getElementById("r-type").value;
  const goal = document.getElementById("r-goal").value.trim();
  const notes = document.getElementById("r-notes").value.trim();
  if (!name || !phone || !address) {
    errorEl.textContent = "Заполните имя, телефон и адрес.";
    errorEl.classList.add("show");
    return;
  }

  const r = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      phone,
      address,
      type,
      status: "активен",
      notes: [goal && `Цель: ${goal}`, notes].filter(Boolean).join(" | "),
    }),
  });
  const data = await r.json();
  if (!data.ok) {
    errorEl.textContent = data.error || "Не удалось отправить заявку.";
    errorEl.classList.add("show");
    return;
  }

  ["r-name", "r-phone", "r-address", "r-goal", "r-notes"].forEach((id) => (document.getElementById(id).value = ""));
  document.getElementById("r-type").value = "ration";
  successEl.classList.add("show");
  toast("✅ Заявка отправлена");
}

async function loadKitchen() {
  const date = document.getElementById("k-date").value;
  if (!date) return;
  const el = document.getElementById("kitchen-content");
  const sendBtn = document.getElementById("kitchen-send-btn");
  el.innerHTML = '<div class="empty"><div class="empty-icon">⏳</div><div class="empty-text">Загрузка...</div></div>';
  sendBtn.style.display = "none";

  try {
    const [clients, orders] = await Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch(`/api/orders?date=${date}`).then((r) => r.json()),
    ]);
    const rationClients = clients.filter((c) => c.type === "ration" && c.status === "активен");
    kitchenData = { ration: rationClients, orders };

    let html = "";
    if (rationClients.length) {
      const totalKcal = rationClients.reduce((s, c) => s + (parseInt(c.kcal, 10) || 0), 0);
      html += `<div class="kitchen-section"><div class="kitchen-section-title">📋 Рационы — ${rationClients.length} чел.</div>`;
      rationClients.forEach((c, i) => {
        html += `<div class="ration-item">
          <div class="ration-num">${i + 1}</div>
          <div class="ration-body">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div class="ration-name">${c.name}</div>
              <div class="ration-kcal">${c.kcal || "?"} ккал</div>
            </div>
            ${c.notes ? `<div class="ration-note">⚠️ ${c.notes}</div>` : ""}
          </div>
        </div>`;
      });
      html += `<div class="summary-box">
        <div class="summary-title">Итого рационы</div>
        <div class="summary-row"><span class="summary-label">Человек</span><span class="summary-val">${rationClients.length}</span></div>
        <div class="summary-row"><span class="summary-label">Общий ккал</span><span class="summary-val">${totalKcal}</span></div>
      </div></div>`;
    }

    if (orders.length) {
      const counts = {};
      orders.forEach((o) => { counts[o.dish] = (counts[o.dish] || 0) + (parseInt(o.qty, 10) || 1); });
      html += `<div class="kitchen-section"><div class="kitchen-section-title">🍱 Обеды — ${orders.length} заказов</div>`;
      html += `<div class="summary-box"><div class="summary-title">Итого порций</div>`;
      Object.entries(counts).forEach(([dish, qty]) => {
        html += `<div class="summary-row"><span class="summary-label">${dish}</span><span class="summary-val">${qty} порц.</span></div>`;
      });
      html += `</div></div>`;
    }

    if (!rationClients.length && !orders.length) {
      el.innerHTML = '<div class="empty"><div class="empty-icon">📭</div><div class="empty-text">Нет данных на эту дату</div></div>';
      return;
    }
    el.innerHTML = html;
    sendBtn.style.display = "block";
  } catch (e) {
    el.innerHTML = `<div class="empty"><div class="empty-text">Ошибка: ${e.message}</div></div>`;
  }
}

async function sendToKitchen() {
  const date = document.getElementById("k-date").value;
  const btn = document.querySelector("#kitchen-send-btn .btn");
  btn.textContent = "⏳ Отправляю...";
  btn.disabled = true;
  try {
    const r = await fetch("/api/kitchen/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, orders: kitchenData.orders, ration_clients: kitchenData.ration }),
    });
    const data = await r.json();
    if (!data.ok) return toast("Ошибка: " + data.error);
    toast("✅ Кухонный лист отправлен");
  } finally {
    btn.textContent = "📨 Отправить повару в EAT&FIT TEAM";
    btn.disabled = false;
  }
}

function loadDishHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

function saveDishToHistory(dish) {
  let h = loadDishHistory();
  h = h.filter((d) => d.name !== dish.name);
  h.unshift(dish);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)));
}

function renderDishHistory() {
  const h = loadDishHistory();
  const block = document.getElementById("dish-history-block");
  const list = document.getElementById("dish-history-list");
  if (!h.length) {
    block.style.display = "none";
    return;
  }
  block.style.display = "";
  list.innerHTML = h.map((d, i) => `
    <div style="display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--border);border-radius:8px;padding:9px 12px">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${d.name}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">${d.kcal} ккал | ${d.type === "protein" ? "🔥" : "⚖️"}</div>
      </div>
      <button style="font-size:11px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--green);color:#fff;cursor:pointer" onclick="fillFromHistory(${i},'1')">Сет 1</button>
      <button style="font-size:11px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--gray);cursor:pointer" onclick="fillFromHistory(${i},'2')">Сет 2</button>
    </div>`).join("");
}

function fillFromHistory(idx, prefix) {
  const d = loadDishHistory()[idx];
  if (!d) return;
  ["name", "type", "kcal", "prot", "fat", "carb", "portion"].forEach((f) => {
    const el = document.getElementById(`d${prefix}-${f}`);
    if (el) el.value = d[f] || "";
  });
  toast(`✓ Сет ${prefix}: ${d.name}`);
}

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1600;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          } else {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadPhoto(prefix, input) {
  const file = input.files[0];
  if (!file) return;
  const box = document.getElementById(prefix + "-photo-box");
  box.innerHTML = '<div class="photo-placeholder">⏳</div><div><div class="photo-info-title">Сжатие и загрузка...</div></div>';
  try {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append("image", compressed, "photo.jpg");
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || "Ошибка ImgBB");

    const url = data.data.url;
    document.getElementById(prefix + "-photo").value = url;
    box.innerHTML = `<img src="${url}" alt="photo"><div><div class="photo-info-title" style="color:var(--green)">✓ Загружено</div></div>`;
  } catch (e) {
    box.innerHTML = `<div class="photo-placeholder">❌</div><div><div class="photo-info-title" style="color:var(--red)">Ошибка: ${e.message}</div></div>`;
  }
}

function buildDishText(name, type, kcal, prot, fat, carb, portion) {
  const icon = type === "protein" ? "🍗" : "🍱";
  const typeStr = type === "protein" ? "🔥 Высокобелковый" : "⚖️ Баланс";
  return `${icon} ${name} — 45 000 сум\n\n${typeStr}\n${kcal || "—"} ккал  |  Б ${prot || "—"}  |  Ж ${fat || "—"}  |  У ${carb || "—"}\n\n🍱 Порция: ~${portion || "450–500"} г\n⏰ Доставка: 10:00 – 12:00  📥 Заказ до 09:00\n\n📩 Заказ: @eat_fit_uz`;
}

function buildOpenText(delivDate) {
  const d = new Date(delivDate);
  const days = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
  const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  return `📢 Приём заказов открыт!\nПринимаем заказы на ${d.getDate()} ${months[d.getMonth()]} (${days[d.getDay()]})\n⏰ Доставка: 10:00 – 12:00  📥 Заказы до 09:00\nМеню выше 👆\n📩 @eat_fit_uz  #eatfit_обед`;
}

function buildRemindText() {
  return "⏰ Последний шанс!\nПриём заказов закрывается в 09:00.\n📩 @eat_fit_uz";
}

async function createDay() {
  const date = document.getElementById("pub-date").value;
  const d1name = document.getElementById("d1-name").value.trim();
  const d2name = document.getElementById("d2-name").value.trim();
  if (!date || !d1name || !d2name) return toast("Заполните дату и оба блюда ⚠️");

  saveDishToHistory({ name: d1name, type: document.getElementById("d1-type").value, kcal: document.getElementById("d1-kcal").value, prot: document.getElementById("d1-prot").value, fat: document.getElementById("d1-fat").value, carb: document.getElementById("d1-carb").value, portion: document.getElementById("d1-portion").value });
  saveDishToHistory({ name: d2name, type: document.getElementById("d2-type").value, kcal: document.getElementById("d2-kcal").value, prot: document.getElementById("d2-prot").value, fat: document.getElementById("d2-fat").value, carb: document.getElementById("d2-carb").value, portion: document.getElementById("d2-portion").value });

  const today = new Date().toISOString().split("T")[0];
  const nextDay = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const posts = [
    { id: uid(), label: "🍱 Сет 1 — " + d1name, tag: "dish", text: buildDishText(d1name, document.getElementById("d1-type").value, document.getElementById("d1-kcal").value, document.getElementById("d1-prot").value, document.getElementById("d1-fat").value, document.getElementById("d1-carb").value, document.getElementById("d1-portion").value), photo_url: document.getElementById("d1-photo").value.trim(), publish_date: today, publish_time: "15:00", status: "ready" },
    { id: uid(), label: "🍱 Сет 2 — " + d2name, tag: "dish", text: buildDishText(d2name, document.getElementById("d2-type").value, document.getElementById("d2-kcal").value, document.getElementById("d2-prot").value, document.getElementById("d2-fat").value, document.getElementById("d2-carb").value, document.getElementById("d2-portion").value), photo_url: document.getElementById("d2-photo").value.trim(), publish_date: today, publish_time: "15:05", status: "ready" },
    { id: uid(), label: "📢 Заказы открыты", tag: "auto", text: buildOpenText(date), photo_url: "", publish_date: today, publish_time: "17:00", status: "ready" },
    { id: uid(), label: "⏰ Последний шанс", tag: "auto", text: buildRemindText(), photo_url: "", publish_date: nextDay, publish_time: "08:45", status: "ready" },
  ];

  const r = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(posts) });
  const data = await r.json();
  if (!data.ok) return toast("Ошибка: " + data.error);
  toast("✅ 4 поста добавлены в очередь!");
  renderDishHistory();
}

async function loadQueue() {
  const el = document.getElementById("queue-list");
  el.innerHTML = '<div class="empty"><div class="empty-icon">⏳</div></div>';
  try {
    const r = await fetch("/api/posts");
    const posts = await r.json();
    const queue = posts.filter((p) => p.status === "ready" || p.status === "draft");
    if (!queue.length) {
      el.innerHTML = '<div class="empty"><div class="empty-icon">📭</div><div class="empty-text">Очередь пустая</div></div>';
      return;
    }
    el.innerHTML = queue.sort((a, b) => (a.publish_date + a.publish_time).localeCompare(b.publish_date + b.publish_time)).map((p) => renderPostItem(p, true)).join("");
  } catch {
    el.innerHTML = '<div class="empty"><div class="empty-text">Ошибка загрузки</div></div>';
  }
}

async function loadHistory() {
  const el = document.getElementById("history-list");
  el.innerHTML = '<div class="empty"><div class="empty-icon">⏳</div></div>';
  try {
    const r = await fetch("/api/posts");
    const posts = await r.json();
    const done = posts.filter((p) => p.status === "posted" || p.status === "error");
    if (!done.length) {
      el.innerHTML = '<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">Нет опубликованных</div></div>';
      return;
    }
    el.innerHTML = done.sort((a, b) => (b.posted_at || "").localeCompare(a.posted_at || "")).map((p) => renderPostItem(p, false)).join("");
  } catch {
    el.innerHTML = '<div class="empty"><div class="empty-text">Ошибка загрузки</div></div>';
  }
}

function renderPostItem(p, isQueue) {
  const badgeClass = { ready: "badge-ready", posted: "badge-posted", error: "badge-error" }[p.status] || "";
  const badgeLabel = { ready: "В очереди", posted: "Опубликован", error: "Ошибка" }[p.status] || p.status;
  const actions = isQueue ? `<div class="post-actions"><button class="btn btn-secondary btn-sm" onclick="publishNow('${p.id}')">🚀 Сейчас</button><button class="btn btn-danger btn-sm" onclick="deletePost('${p.id}')">🗑</button></div>` : "";
  return `<div class="post-item">
    <div class="post-item-header">
      <span class="post-time">${p.publish_time || "-"}</span>
      <span class="post-name">${p.label || "-"}</span>
      <span class="post-tag ${p.tag === "auto" ? "tag-auto" : "tag-dish"}">${p.tag === "auto" ? "авто" : "блюдо"}</span>
    </div>
    <div class="post-item-body">
      <div class="post-text-preview">${p.text || ""}</div>
      <div class="post-meta">
        <span class="badge ${badgeClass}">${badgeLabel}</span>
        ${p.photo_url ? '<span class="badge badge-photo">📷</span>' : ""}
        <span style="font-size:11px;color:var(--muted)">${p.publish_date || ""}</span>
      </div>
      ${p.error ? `<div style="font-size:12px;color:var(--red);margin-top:6px">⚠️ ${p.error}</div>` : ""}
      ${actions}
    </div>
  </div>`;
}

async function publishNow(id) {
  const r = await fetch(`/api/posts/${id}/publish`, { method: "POST" });
  const data = await r.json();
  if (!data.ok) return toast("Ошибка: " + data.error);
  toast("✅ Опубликовано!");
  loadQueue();
}

async function deletePost(id) {
  if (!confirm("Удалить пост?")) return;
  await fetch(`/api/posts/${id}`, { method: "DELETE" });
  loadQueue();
  toast("Удалено");
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

function uid() {
  return "tg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
}

// ── DEPOSITS ──────────────────────────────────────────────────

async function loadDepositClients() {
  const r = await fetch("/api/clients");
  const clients = await r.json();
  const sel = document.getElementById("dep-client");
  sel.innerHTML = '<option value="">Выберите клиента...</option>' +
    clients.map(c => `<option value="${c.id}">${c.name} (${c.phone || "—"})</option>`).join("");

  sel.onchange = () => {
    if (sel.value) loadClientBalance(sel.value);
    else document.getElementById("dep-client-info").style.display = "none";
  };

  loadAllBalances(clients);
}

async function loadClientBalance(clientId) {
  const r = await fetch("/api/deposits/" + clientId);
  const data = await r.json();
  document.getElementById("dep-client-info").style.display = "block";
  const color = data.balance >= 0 ? "var(--green)" : "var(--red)";
  document.getElementById("dep-balance").innerHTML =
    `<span style="color:${color}">${Number(data.balance).toLocaleString("ru")} сум</span>`;

  const hist = document.getElementById("dep-history");
  if (!data.history || !data.history.length) {
    hist.innerHTML = '<div class="card" style="color:var(--muted);font-size:13px">Нет операций</div>';
    return;
  }
  hist.innerHTML = data.history.slice(0, 20).map(d => {
    const isPlus = d.amount >= 0;
    const sign = isPlus ? "+" : "";
    const badge = isPlus
      ? '<span class="status-badge st-done">пополнение</span>'
      : '<span class="status-badge st-cooking">списание</span>';
    const dateStr = new Date(d.created_at).toLocaleDateString("ru");
    return `<div class="order-item" style="margin-bottom:6px">
      <div class="order-header">
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:${isPlus ? 'var(--green)' : 'var(--red)'}">
            ${sign}${Number(d.amount).toLocaleString("ru")} сум
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">${d.note || "—"} · ${dateStr}</div>
        </div>
        ${badge}
      </div>
    </div>`;
  }).join("");
}

async function addDeposit() {
  const clientId = document.getElementById("dep-client").value;
  const amount = parseInt(document.getElementById("dep-amount").value);
  const type = document.getElementById("dep-type").value;
  const note = document.getElementById("dep-note").value.trim();

  if (!clientId || !amount) { toast("Выберите клиента и укажите сумму ⚠️"); return; }

  const r = await fetch("/api/deposits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, amount, type, note }),
  });
  const data = await r.json();
  if (data.ok) {
    toast("✅ Депозит внесён!");
    document.getElementById("dep-amount").value = "";
    document.getElementById("dep-note").value = "";
    loadClientBalance(clientId);
    loadAllBalances();
  } else {
    toast("Ошибка: " + (data.error || ""));
  }
}

async function loadAllBalances(clientsList) {
  const clients = clientsList || await fetch("/api/clients").then(r => r.json());
  const el = document.getElementById("dep-all-balances");
  if (!clients.length) { el.innerHTML = '<div style="color:var(--muted);font-size:13px">Нет клиентов</div>'; return; }

  const balances = await Promise.all(
    clients.map(c => fetch("/api/deposits/" + c.id).then(r => r.json()).then(d => ({ ...c, balance: d.balance })))
  );

  balances.sort((a, b) => b.balance - a.balance);

  el.innerHTML = balances.map(c => {
    const color = c.balance > 0 ? "var(--green)" : c.balance < 0 ? "var(--red)" : "var(--muted)";
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-size:14px;font-weight:600">${c.name}</div>
        <div style="font-size:12px;color:var(--muted)">${c.type === 'ration' ? '📋 Рацион' : '🍱 Ланч'}</div>
      </div>
      <div style="font-size:15px;font-weight:800;color:${color}">${Number(c.balance).toLocaleString("ru")} сум</div>
    </div>`;
  }).join("");
}

function logoutStaff() {
  localStorage.removeItem("eatfit_client_token");
  window.location.replace("/login.html");
}
