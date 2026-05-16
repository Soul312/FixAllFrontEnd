import { clearAuth, getAuth } from "./auth.js";

const DEFAULT_BASE_URL = "http://localhost:8080";

function resolveUrl(path) {
  if (path.startsWith("http")) {
    return path;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;
  return `${baseUrl}${path}`;
}

export async function apiFetch(path, options = {}) {
  const auth = getAuth();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(resolveUrl(path), {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
}

export async function apiJson(path, options) {
  const response = await apiFetch(path, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
