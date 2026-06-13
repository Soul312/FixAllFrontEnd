import { clearAuth, getAuth } from "./auth.js";

const DEFAULT_BASE_URL = "http://localhost:8080";

function resolveUrl(path) {
  if (path.startsWith("http")) {
    return path;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;
  return `${baseUrl}${path}`;
}

/**
 * Parse a structured error message from the backend response.
 * The backend returns JSON like: { status, error, message }
 * We extract the user-friendly "message" field.
 */
async function parseErrorResponse(response) {
  const status = response.status;
  let message = "";

  try {
    const text = await response.text();
    if (text) {
      try {
        const json = JSON.parse(text);
        // Backend returns { message: "..." } in error responses
        message = json.message || json.error || text;
      } catch {
        // Not JSON — use raw text
        message = text;
      }
    }
  } catch {
    // Could not read body
  }

  // If we still have no message, generate one from the status code
  if (!message) {
    switch (status) {
      case 400: message = "Bad request — please check your input and try again."; break;
      case 401: message = "Authentication required — please log in again."; break;
      case 403: message = "Access denied — you don't have permission for this action."; break;
      case 404: message = "Not found — the requested resource does not exist."; break;
      case 409: message = "Conflict — this action conflicts with the current state."; break;
      case 422: message = "Validation error — please check your input."; break;
      case 500: message = "Server error — something went wrong on our end. Please try again later."; break;
      case 502: message = "Unable to reach the server — it may be down or restarting."; break;
      case 503: message = "Service unavailable — the server is temporarily overloaded."; break;
      default:  message = `Request failed (${status}).`;
    }
  }

  return message;
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

  let response;
  try {
    response = await fetch(resolveUrl(path), {
      ...options,
      headers
    });
  } catch (networkError) {
    // Network-level failure (server down, no internet, CORS blocked, etc.)
    throw new Error(
      "Unable to connect to the server. Please check that the backend is running and try again."
    );
  }

  if (response.status === 401) {
    clearAuth();
    // Don't redirect immediately — let the caller handle the error message
    throw new Error("Your session has expired. Please log in again.");
  }

  return response;
}

export async function apiJson(path, options) {
  const response = await apiFetch(path, options);

  if (!response.ok) {
    const message = await parseErrorResponse(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
