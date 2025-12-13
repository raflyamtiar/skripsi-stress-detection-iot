const sanitizeBaseUrl = (url) => (url.endsWith("/") ? url.slice(0, -1) : url);
const API_BASE_URL = sanitizeBaseUrl(
  import.meta.env.VITE_STRESS_API_BASE
);

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function setAccessToken(token) {
  if (token) localStorage.setItem("access_token", token);
  else localStorage.removeItem("access_token");
}

export function setUser(user) {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");
}

export function getUser() {
  try {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = Object.assign({}, options.headers || {});
  headers["ngrok-skip-browser-warning"] = "true";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, Object.assign({}, options, { headers }));
  return res;
}

export { API_BASE_URL };
