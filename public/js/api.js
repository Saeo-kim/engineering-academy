export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`/api/${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is it still running?');
  }
  const data = await res.json().catch(() => null);
  if (res.status === 401 && path !== 'login') window.dispatchEvent(new CustomEvent('auth-required'));
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Request failed (${res.status}).`);
  return data;
}

const queryString = (params) => {
  const entries = Object.entries(params ?? {}).filter(([, v]) => v);
  return entries.length ? `?${new URLSearchParams(entries)}` : '';
};

export const api = {
  session: () => request('GET', 'session'),
  login: (password) => request('POST', 'login', { password }),
  logout: () => request('POST', 'logout'),
  meta: () => request('GET', 'meta'),
  dashboard: () => request('GET', 'dashboard'),
  options: () => request('GET', 'options'),
  search: (q) => request('GET', `search${queryString({ q })}`),
  capture: (body) => request('POST', 'capture', body),
  list: (kind, params) => request('GET', `${kind}${queryString(params)}`),
  get: (kind, id) => request('GET', `${kind}/${id}`),
  create: (kind, body) => request('POST', kind, body),
  update: (kind, id, body) => request('PUT', `${kind}/${id}`, body),
  remove: (kind, id) => request('DELETE', `${kind}/${id}`),
  study: (kind, id) => request('POST', `${kind}/${id}/study`),
  removeSamples: () => request('DELETE', 'samples'),
  // Learning loop
  learning: (kind, id) => request('GET', `learn/${kind}/${id}`),
  attempt: (kind, id, mode, response) => request('POST', `learn/${kind}/${id}/attempts`, { mode, response }),
  rateAttempt: (attemptId, rating) => request('POST', `attempts/${attemptId}/rating`, { rating }),
  reviewQueue: () => request('GET', 'review'),
  review: (kind, id, rating) => request('POST', `review/${kind}/${id}`, { rating }),
  quizzes: () => request('GET', 'quizzes'),
  quiz: (id) => request('GET', `quizzes/${id}`),
  createQuiz: (body) => request('POST', 'quizzes', body),
  submitQuiz: (id, answers) => request('POST', `quizzes/${id}/submit`, { answers }),
  map: () => request('GET', 'map'),
  link: (a, b) => request('POST', 'links', { a, b }),
  unlink: (a, b) => request('DELETE', 'links', { a, b }),
  progress: () => request('GET', 'progress'),
};
