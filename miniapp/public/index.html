<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>EAT & FIT — Посты</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
  :root {
    --green: #2d6a4f;
    --green-light: #d8f3dc;
    --green-text: #1b4332;
    --orange: #f4a261;
    --orange-light: #fff3e0;
    --orange-text: #7c4700;
    --gray: #f8f9fa;
    --border: #e9ecef;
    --text: #212529;
    --muted: #6c757d;
    --danger: #dc3545;
    --danger-light: #fff5f5;
    --radius: 12px;
    --radius-sm: 8px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--gray); color: var(--text); font-size: 15px; min-height: 100vh; }

  /* Nav */
  .nav { display: flex; background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
  .nav-tab { flex: 1; padding: 14px 8px; text-align: center; font-size: 13px; font-weight: 500; color: var(--muted); border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; }
  .nav-tab.active { color: var(--green); border-bottom-color: var(--green); }

  /* Pages */
  .page { display: none; padding: 16px; max-width: 500px; margin: 0 auto; }
  .page.active { display: block; }

  /* Cards */
  .card { background: #fff; border-radius: var(--radius); padding: 16px; margin-bottom: 12px; border: 1px solid var(--border); }
  .card-title { font-size: 13px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; margin-bottom: 14px; }

  /* Form fields */
  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px; font-weight: 500; }
  .field input, .field select, .field textarea { width: 100%; padding: 12px 14px; font-size: 15px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); background: #fff; color: var(--text); font-family: inherit; outline: none; -webkit-appearance: none; appearance: none; }
  .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--green); }
  .field textarea { resize: none; min-height: 90px; line-height: 1.5; }
  .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .row4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }

  /* Photo preview */
  .photo-box { border: 1.5px dashed var(--border); border-radius: var(--radius-sm); padding: 14px; display: flex; align-items: center; gap: 12px; margin-top: 8px; background: var(--gray); }
  .photo-box img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
  .photo-placeholder { width: 56px; height: 56px; border-radius: 8px; background: var(--border); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .photo-info-title { font-size: 13px; font-weight: 500; }
  .photo-info-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

  /* Buttons */
  .btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; font-size: 15px; font-weight: 600; border-radius: var(--radius-sm); border: none; cursor: pointer; font-family: inherit; transition: opacity .15s; }
  .btn:active { opacity: .8; }
  .btn-primary { background: var(--green); color: #fff; }
  .btn-secondary { background: var(--gray); color: var(--text); border: 1px solid var(--border); }
  .btn-danger { background: var(--danger-light); color: var(--danger); border: 1px solid #ffcdd2; }
  .btn-sm { padding: 8px 14px; font-size: 13px; width: auto; border-radius: 8px; font-weight: 500; }

  /* Timeline schedule strip */
  .schedule-strip { display: flex; gap: 0; margin-bottom: 16px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border); }
  .sched-item { flex: 1; padding: 10px 6px; text-align: center; background: #fff; border-right: 1px solid var(--border); }
  .sched-item:last-child { border-right: none; }
  .sched-time { font-size: 14px; font-weight: 700; color: var(--green); }
  .sched-label { font-size: 10px; color: var(--muted); margin-top: 2px; line-height: 1.3; }

  /* Post list item */
  .post-item { background: #fff; border-radius: var(--radius); margin-bottom: 10px; border: 1px solid var(--border); overflow: hidden; }
  .post-item-header { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--gray); border-bottom: 1px solid var(--border); }
  .post-time { font-size: 13px; font-weight: 700; color: var(--green); min-width: 44px; }
  .post-name { font-size: 13px; font-weight: 500; flex: 1; }
  .post-tag { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
  .tag-dish { background: var(--orange-light); color: var(--orange-text); }
  .tag-auto { background: var(--green-light); color: var(--green-text); }
  .post-item-body { padding: 12px 14px; }
  .post-text-preview { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6; white-space: pre-wrap; color: var(--text); max-height: 120px; overflow: hidden; position: relative; }
  .post-text-preview::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(transparent, #fff); }
  .post-meta { display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
  .badge-ready { background: var(--green-light); color: var(--green-text); }
  .badge-posted { background: #e3f2fd; color: #0d47a1; }
  .badge-error { background: var(--danger-light); color: var(--danger); }
  .badge-draft { background: var(--gray); color: var(--muted); border: 1px solid var(--border); }
  .badge-photo { background: var(--orange-light); color: var(--orange-text); }
  .post-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }

  /* Status dot */
  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
  .dot-green { background: #40c057; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

  /* Toast */
  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #212529; color: #fff; padding: 12px 20px; border-radius: 24px; font-size: 14px; font-weight: 500; z-index: 999; white-space: nowrap; opacity: 0; transition: opacity .3s; }
  .toast.show { opacity: 1; }

  /* Section header */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .section-title { font-size: 16px; font-weight: 700; }

  /* Empty state */
  .empty { text-align: center; padding: 48px 16px; color: var(--muted); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; }

  /* Divider */
  .divider { height: 1px; background: var(--border); margin: 14px 0; }

  /* Step dots */
  .steps { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
  .step-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); }
  .step-dot.active { background: var(--green); width: 24px; border-radius: 4px; }
  .step-line { flex: 1; height: 1px; background: var(--border); }
</style>
</head>
<body>

<!-- Navigation -->
<nav class="nav">
  <button class="nav-tab active" onclick="showTab('plan')">📅 Создать день</button>
  <button class="nav-tab" onclick="showTab('queue')">🕐 Очередь</button>
  <button class="nav-tab" onclick="showTab('history')">✅ История</button>
</nav>

<!-- ══════════════════════════════════════════
     PAGE 1 — PLAN DAY
══════════════════════════════════════════ -->
<div class="page active" id="page-plan">

  <!-- Schedule strip -->
  <div style="margin: 16px 0 4px; font-size: 13px; color: var(--muted); font-weight: 500;">Расписание постов</div>
  <div class="schedule-strip" style="margin-bottom:16px">
    <div class="sched-item"><div class="sched-time">15:00</div><div class="sched-label">Сет 1</div></div>
    <div class="sched-item"><div class="sched-time">15:05</div><div class="sched-label">Сет 2</div></div>
    <div class="sched-item"><div class="sched-time">17:00</div><div class="sched-label">Заказы открыты</div></div>
    <div class="sched-item"><div class="sched-time">08:45</div><div class="sched-label">Последний шанс</div></div>
  </div>

  <!-- Date -->
  <div class="card">
    <div class="card-title">Дата блюд (когда доставка)</div>
    <div class="field" style="margin-bottom:0">
      <input type="date" id="pub-date">
    </div>
  </div>

  <!-- Dish history -->
  <div id="dish-history-block" style="display:none;margin-bottom:12px">
    <div style="font-size:12px;color:var(--muted);font-weight:500;margin-bottom:8px">📚 Прошлые блюда — нажми чтобы заполнить</div>
    <div id="dish-history-list" style="display:flex;flex-direction:column;gap:6px"></div>
  </div>

  <!-- Dish 1 -->
  <div class="card">
    <div class="card-title">🍱 Сет 1</div>
    <div class="field">
      <label>Название блюда</label>
      <input type="text" id="d1-name" placeholder="Куриные котлеты с гречкой">
    </div>
    <div class="row2" style="margin-bottom:14px">
      <div class="field" style="margin:0">
        <label>Тип</label>
        <select id="d1-type">
          <option value="balance">⚖️ Баланс</option>
          <option value="protein">🔥 Высокобелковый</option>
        </select>
      </div>
      <div class="field" style="margin:0">
        <label>Порция (г)</label>
        <input type="text" id="d1-portion" placeholder="500–550">
      </div>
    </div>
    <div class="row4" style="margin-bottom:14px">
      <div class="field" style="margin:0"><label>Ккал</label><input type="number" id="d1-kcal" placeholder="550"></div>
      <div class="field" style="margin:0"><label>Белки</label><input type="number" id="d1-prot" placeholder="42"></div>
      <div class="field" style="margin:0"><label>Жиры</label><input type="number" id="d1-fat" placeholder="18"></div>
      <div class="field" style="margin:0"><label>Угл.</label><input type="number" id="d1-carb" placeholder="55"></div>
    </div>
    <input type="hidden" id="d1-photo">
    <div id="d1-photo-box" class="photo-box" onclick="document.getElementById('d1-file').click()" style="cursor:pointer">
      <div class="photo-placeholder">📷</div>
      <div><div class="photo-info-title">Нажмите чтобы выбрать фото</div><div class="photo-info-sub">Из галереи телефона</div></div>
    </div>
    <input type="file" id="d1-file" accept="image/*" style="display:none" onchange="uploadPhoto('d1', this)">
  </div>

  <!-- Dish 2 -->
  <div class="card">
    <div class="card-title">🍱 Сет 2</div>
    <div class="field">
      <label>Название блюда</label>
      <input type="text" id="d2-name" placeholder="Лосось с бурым рисом">
    </div>
    <div class="row2" style="margin-bottom:14px">
      <div class="field" style="margin:0">
        <label>Тип</label>
        <select id="d2-type">
          <option value="protein">🔥 Высокобелковый</option>
          <option value="balance">⚖️ Баланс</option>
        </select>
      </div>
      <div class="field" style="margin:0">
        <label>Порция (г)</label>
        <input type="text" id="d2-portion" placeholder="450–500">
      </div>
    </div>
    <div class="row4" style="margin-bottom:14px">
      <div class="field" style="margin:0"><label>Ккал</label><input type="number" id="d2-kcal" placeholder="480"></div>
      <div class="field" style="margin:0"><label>Белки</label><input type="number" id="d2-prot" placeholder="48"></div>
      <div class="field" style="margin:0"><label>Жиры</label><input type="number" id="d2-fat" placeholder="14"></div>
      <div class="field" style="margin:0"><label>Угл.</label><input type="number" id="d2-carb" placeholder="38"></div>
    </div>
    <input type="hidden" id="d2-photo">
    <div id="d2-photo-box" class="photo-box" onclick="document.getElementById('d2-file').click()" style="cursor:pointer">
      <div class="photo-placeholder">📷</div>
      <div><div class="photo-info-title">Нажмите чтобы выбрать фото</div><div class="photo-info-sub">Из галереи телефона</div></div>
    </div>
    <input type="file" id="d2-file" accept="image/*" style="display:none" onchange="uploadPhoto('d2', this)">
  </div>

  <button class="btn btn-primary" onclick="createDay()" style="margin-bottom:32px">
    📤 Поставить 4 поста в очередь
  </button>
</div>

<!-- ══════════════════════════════════════════
     PAGE 2 — QUEUE
══════════════════════════════════════════ -->
<div class="page" id="page-queue">
  <div style="padding: 16px 0 4px; display:flex; align-items:center; gap:8px;">
    <span class="dot dot-green"></span>
    <span style="font-size:13px;color:var(--muted)">Планировщик активен — проверяет каждую минуту</span>
  </div>
  <div id="queue-list" style="margin-top:8px"></div>
</div>

<!-- ══════════════════════════════════════════
     PAGE 3 — HISTORY
══════════════════════════════════════════ -->
<div class="page" id="page-history">
  <div style="padding: 16px 0 8px;">
    <div style="font-size:16px;font-weight:700">История публикаций</div>
  </div>
  <div id="history-list"></div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

// ── Init history ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', renderHistory);

// ── Set today's date ──────────────────────────────────────────
(function(){
  const d = new Date();
  // Default to tomorrow (dishes for tomorrow)
  d.setDate(d.getDate() + 1);
  document.getElementById('pub-date').value = d.toISOString().split('T')[0];
})();

// ── Tab navigation ────────────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  event.currentTarget.classList.add('active');
  if (name === 'queue') loadQueue();
  if (name === 'history') loadHistory();
}

// ── Dish history ──────────────────────────────────────────────
const HISTORY_KEY = 'eatfit_dish_history';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function saveToHistory(dish) {
  let history = loadHistory();
  // Remove duplicate by name
  history = history.filter(d => d.name !== dish.name);
  // Add to front
  history.unshift(dish);
  // Keep last 20
  history = history.slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
  const history = loadHistory();
  const block = document.getElementById('dish-history-block');
  const list = document.getElementById('dish-history-list');
  if (!history.length) { block.style.display = 'none'; return; }
  block.style.display = '';
  list.innerHTML = history.map((d, i) => `
    <div style="display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer" onclick="fillFromHistory(${i}, '1')" >
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${d.name}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">${d.kcal} ккал | Б${d.prot} Ж${d.fat} У${d.carb} | ${d.portion}г | ${d.type==='protein'?'🔥':'⚖️'}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button style="font-size:11px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--green);color:#fff;cursor:pointer" onclick="event.stopPropagation();fillFromHistory(${i},'1')">Сет 1</button>
        <button style="font-size:11px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--gray);cursor:pointer" onclick="event.stopPropagation();fillFromHistory(${i},'2')">Сет 2</button>
      </div>
    </div>
  `).join('');
}

function fillFromHistory(idx, prefix) {
  const history = loadHistory();
  const d = history[idx];
  if (!d) return;
  document.getElementById(`d${prefix}-name`).value = d.name;
  document.getElementById(`d${prefix}-type`).value = d.type;
  document.getElementById(`d${prefix}-kcal`).value = d.kcal;
  document.getElementById(`d${prefix}-prot`).value = d.prot;
  document.getElementById(`d${prefix}-fat`).value = d.fat;
  document.getElementById(`d${prefix}-carb`).value = d.carb;
  document.getElementById(`d${prefix}-portion`).value = d.portion;
  toast(`✓ Сет ${prefix} заполнен: ${d.name}`);
}

// ── Photo upload via ImgBB ────────────────────────────────────
const IMGBB_KEY = '2c809fab10891ae2d68a20d3e5f4350b';

async function uploadPhoto(prefix, input) {
  const file = input.files[0];
  if (!file) return;
  const box = document.getElementById(prefix + '-photo-box');
  box.innerHTML = '<div class="photo-placeholder">⏳</div><div><div class="photo-info-title">Загрузка...</div><div class="photo-info-sub">Подождите несколько секунд</div></div>';

  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      const url = data.data.url;
      document.getElementById(prefix + '-photo').value = url;
      box.innerHTML = `<img src="${url}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;flex-shrink:0"><div><div class="photo-info-title" style="color:#2d6a4f">✓ Фото загружено</div><div class="photo-info-sub">Выйдет через sendPhoto</div></div>`;
    } else {
      throw new Error('ImgBB error');
    }
  } catch(e) {
    box.innerHTML = '<div class="photo-placeholder">❌</div><div><div class="photo-info-title" style="color:#dc3545">Ошибка загрузки</div><div class="photo-info-sub">Попробуйте ещё раз</div></div>';
    toast('Ошибка загрузки фото');
  }
}

// ── Build post texts ──────────────────────────────────────────
function buildDishText(name, type, kcal, prot, fat, carb, portion) {
  const icon = type === 'protein' ? '🍗' : '🍱';
  const typeStr = type === 'protein' ? '🔥 Высокобелковый' : '⚖️ Баланс';
  return `${icon} ${name} — 45 000 сўм\n\n${typeStr}\n\n${kcal||'—'} ккал  |  Б ${prot||'—'}  |  Ж ${fat||'—'}  |  У ${carb||'—'}\n\n🍱 Порция: ~${portion||'450–500'} г\n\n⏰ Етказиш: 10:00 – 12:00\n📥 Заказ: 09:00 гача\n\n📩 Буюртма: @eat_fit_uz\n#eatfit_обед`;
}

function buildOpenText(delivDate) {
  const d = new Date(delivDate);
  const days = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  return `📢 Приём заказов открыт!\n\nПринимаем заказы на ${d.getDate()} ${months[d.getMonth()]} (${days[d.getDay()]}).\n\n⏰ Доставка: 10:00 – 12:00\n📥 Заказ принимается до 09:00\n\nМеню уже выше — выбирай и пиши! 👆\n\n📩 Буюртма: @eat_fit_uz\n#eatfit_обед`;
}

function buildRemindText() {
  return `⏰ Последний шанс!\n\nПриём заказов закрывается в 09:00.\n\nУспей оформить — напиши прямо сейчас.\n\n📩 @eat_fit_uz\n#eatfit_обед`;
}

// ── Create day ────────────────────────────────────────────────
async function createDay() {
  const date = document.getElementById('pub-date').value;
  const d1name = document.getElementById('d1-name').value.trim();
  const d2name = document.getElementById('d2-name').value.trim();
  if (!date || !d1name || !d2name) { toast('Заполните дату и оба блюда ⚠️'); return; }

  // Save to history
  saveToHistory({ name: d1name, type: document.getElementById('d1-type').value, kcal: document.getElementById('d1-kcal').value, prot: document.getElementById('d1-prot').value, fat: document.getElementById('d1-fat').value, carb: document.getElementById('d1-carb').value, portion: document.getElementById('d1-portion').value||'450–500' });
  saveToHistory({ name: d2name, type: document.getElementById('d2-type').value, kcal: document.getElementById('d2-kcal').value, prot: document.getElementById('d2-prot').value, fat: document.getElementById('d2-fat').value, carb: document.getElementById('d2-carb').value, portion: document.getElementById('d2-portion').value||'450–500' });

  // Posts go out TODAY (plan date), dishes delivered on selected date
  const today = new Date().toISOString().split('T')[0];
  const nextDay = (() => { const d = new Date(today); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })();

  const posts = [
    {
      id: uid(), label: '🍱 Сет 1 — ' + d1name, tag: 'dish',
      text: buildDishText(d1name, document.getElementById('d1-type').value,
        document.getElementById('d1-kcal').value, document.getElementById('d1-prot').value,
        document.getElementById('d1-fat').value, document.getElementById('d1-carb').value,
        document.getElementById('d1-portion').value),
      photo_url: document.getElementById('d1-photo').value.trim(),
      publish_date: today, publish_time: '15:00', status: 'ready'
    },
    {
      id: uid(), label: '🍱 Сет 2 — ' + d2name, tag: 'dish',
      text: buildDishText(d2name, document.getElementById('d2-type').value,
        document.getElementById('d2-kcal').value, document.getElementById('d2-prot').value,
        document.getElementById('d2-fat').value, document.getElementById('d2-carb').value,
        document.getElementById('d2-portion').value),
      photo_url: document.getElementById('d2-photo').value.trim(),
      publish_date: today, publish_time: '15:05', status: 'ready'
    },
    {
      id: uid(), label: '📢 Заказы открыты', tag: 'auto',
      text: buildOpenText(date),
      photo_url: '',
      publish_date: today, publish_time: '17:00', status: 'ready'
    },
    {
      id: uid(), label: '⏰ Последний шанс', tag: 'auto',
      text: buildRemindText(),
      photo_url: '',
      publish_date: nextDay, publish_time: '08:45', status: 'ready'
    }
  ];

  try {
    const r = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(posts)
    });
    const data = await r.json();
    if (data.ok) {
      toast('✅ 4 поста добавлены в очередь!');
      // Reset form
      ['d1-name','d2-name','d1-kcal','d1-prot','d1-fat','d1-carb','d1-portion',
       'd2-kcal','d2-prot','d2-fat','d2-carb','d2-portion','d1-photo','d2-photo'].forEach(id => {
        document.getElementById(id).value = '';
      });
      ['d1','d2'].forEach(p => {
        document.getElementById(p+'-photo').value='';
        document.getElementById(p+'-photo-box').innerHTML='<div class="photo-placeholder">📷</div><div><div class="photo-info-title">Нажмите чтобы выбрать фото</div><div class="photo-info-sub">Из галереи телефона</div></div>';
      });
      setTimeout(() => {
        document.querySelectorAll('.nav-tab')[1].click();
      }, 1200);
    }
  } catch(e) { toast('Ошибка: ' + e.message); }
}

// ── Load queue ────────────────────────────────────────────────
async function loadQueue() {
  const el = document.getElementById('queue-list');
  el.innerHTML = '<div class="empty"><div class="empty-icon">⏳</div><div class="empty-text">Загрузка...</div></div>';
  try {
    const r = await fetch('/api/posts');
    const posts = await r.json();
    const queue = posts.filter(p => p.status === 'ready' || p.status === 'draft');
    if (!queue.length) {
      el.innerHTML = '<div class="empty"><div class="empty-icon">📭</div><div class="empty-text">Очередь пустая — создайте день во вкладке «Создать»</div></div>';
      return;
    }
    el.innerHTML = queue.sort((a,b) => (a.publish_date+a.publish_time).localeCompare(b.publish_date+b.publish_time)).map(p => renderPostItem(p, true)).join('');
  } catch(e) { el.innerHTML = '<div class="empty"><div class="empty-text">Ошибка загрузки</div></div>'; }
}

// ── Load history ──────────────────────────────────────────────
async function loadHistory() {
  const el = document.getElementById('history-list');
  el.innerHTML = '<div class="empty"><div class="empty-icon">⏳</div><div class="empty-text">Загрузка...</div></div>';
  try {
    const r = await fetch('/api/posts');
    const posts = await r.json();
    const done = posts.filter(p => p.status === 'posted' || p.status === 'error');
    if (!done.length) {
      el.innerHTML = '<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">Ещё нет опубликованных постов</div></div>';
      return;
    }
    el.innerHTML = done.sort((a,b) => (b.posted_at||'').localeCompare(a.posted_at||'')).map(p => renderPostItem(p, false)).join('');
  } catch(e) { el.innerHTML = '<div class="empty"><div class="empty-text">Ошибка загрузки</div></div>'; }
}

// ── Render post item ──────────────────────────────────────────
function renderPostItem(p, isQueue) {
  const badgeClass = { ready:'badge-ready', posted:'badge-posted', error:'badge-error', draft:'badge-draft' }[p.status] || 'badge-draft';
  const badgeLabel = { ready:'В очереди', posted:'Опубликован', error:'Ошибка', draft:'Черновик' }[p.status] || p.status;
  const photoBadge = p.photo_url ? `<span class="badge badge-photo">📷 Фото</span>` : '';
  const postedAt = p.posted_at ? `<span style="font-size:11px;color:var(--muted)">${new Date(p.posted_at).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>` : '';
  const errMsg = p.error ? `<div style="font-size:12px;color:var(--danger);margin-top:6px">⚠️ ${p.error}</div>` : '';

  const actions = isQueue ? `
    <div class="post-actions">
      <button class="btn btn-secondary btn-sm" onclick="publishNow('${p.id}')">🚀 Опубликовать сейчас</button>
      <button class="btn btn-danger btn-sm" onclick="deletePost('${p.id}')">🗑</button>
    </div>
  ` : '';

  return `<div class="post-item" id="pitem-${p.id}">
    <div class="post-item-header">
      <span class="post-time">${p.publish_time}</span>
      <span class="post-name">${p.label}</span>
      <span class="post-tag ${p.tag==='auto'?'tag-auto':'tag-dish'}">${p.tag==='auto'?'авто':'блюдо'}</span>
    </div>
    <div class="post-item-body">
      <div class="post-text-preview">${p.text}</div>
      <div class="post-meta">
        <span class="badge ${badgeClass}">${badgeLabel}</span>
        ${photoBadge}
        <span style="font-size:11px;color:var(--muted)">${p.publish_date}</span>
        ${postedAt}
      </div>
      ${errMsg}
      ${actions}
    </div>
  </div>`;
}

// ── Publish now ───────────────────────────────────────────────
async function publishNow(id) {
  try {
    const r = await fetch(`/api/posts/${id}/publish`, { method: 'POST' });
    const data = await r.json();
    if (data.ok) { toast('✅ Опубликовано!'); loadQueue(); }
    else toast('Ошибка: ' + data.error);
  } catch(e) { toast('Ошибка: ' + e.message); }
}

// ── Delete post ───────────────────────────────────────────────
async function deletePost(id) {
  if (!confirm('Удалить пост?')) return;
  try {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    document.getElementById('pitem-' + id)?.remove();
    toast('Удалено');
  } catch(e) { toast('Ошибка'); }
}

// ── Toast ─────────────────────────────────────────────────────
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function uid() { return 'tg_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }
</script>
</body>
</html>
