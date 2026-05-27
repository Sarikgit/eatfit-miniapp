const AUTH_TOKEN_KEY = "eatfit_client_token";

function saveToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

async function requireAuth() {
  const token = getToken();
  if (!token) {
    location.href = "/login.html";
    return null;
  }
  const r = await authFetch("/api/auth/me");
  if (!r.ok) {
    clearToken();
    location.href = "/login.html";
    return null;
  }
  const data = await r.json();
  return data.client;
}

function logout() {
  clearToken();
  location.href = "/login.html";
}
