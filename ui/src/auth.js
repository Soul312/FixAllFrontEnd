const STORAGE_KEY = "fixall.auth";

export function getAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

