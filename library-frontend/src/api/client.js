const DEFAULT_BASE_URL = 'http://localhost:5000/api';

const getBaseUrl = () => {
  const envUrl = import.meta?.env?.VITE_API_BASE_URL;
  return (envUrl && String(envUrl).trim()) || DEFAULT_BASE_URL;
};

const buildUrl = (path) => {
  const base = getBaseUrl().replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${base}/${p}`;
};

const getToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(method, path, { body, headers, raw } = {}) {
  const token = getToken();

  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      ...(raw ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && data.message) ||
      (typeof data === 'string' && data) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, { status: res.status, data });
  }

  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  del: (path) => request('DELETE', path),
  postRaw: (path, rawBody, headers = {}) => request('POST', path, { body: rawBody, raw: true, headers }),
};

