const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Django sets the csrftoken cookie as a side effect of this call; the
// browser then attaches it automatically, we just need to read it back
// into the X-CSRFToken header on state-changing requests.
export async function ensureCsrfCookie() {
  await fetch(`${API_BASE}/api/auth/csrf/`, { credentials: 'include' });
}

async function request(path, { method = 'GET', body } = {}) {
  const isUnsafe = method !== 'GET' && method !== 'HEAD';
  const headers = { 'Content-Type': 'application/json' };
  if (isUnsafe) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.detail || `Request to ${path} failed with ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
