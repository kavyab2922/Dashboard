/**
 * API boundary for the HROrbit Express backend. All business data is fetched
 * from the backend (PostgreSQL via the API); no local demo data lives here.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Provider URLs are centralized for diagnostics/documentation; gameplay fetches
// stay server-side so answer keys and reward validation are never exposed.
export const GAME_APIS = Object.freeze({
  sudoku: 'https://sudoku-api.vercel.app/api/dosuku',
  quiz: 'https://opentdb.com/api.php?amount=10&type=multiple',
  word: 'https://api.datamuse.com/words?ml=game&max=10',
  trivia: 'https://the-trivia-api.com/v2/questions?limit=10',
});

export function getToken() {
  return localStorage.getItem('hrobit-auth-token');
}

/**
 * Turns backend-relative media paths (e.g. "/uploads/cover-1.png") into absolute
 * URLs so images load correctly from the Vite dev origin / any deployment host.
 */
export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return url;
}

/** Uploads an image file via the existing /api/upload endpoint (multipart). */
async function uploadFile(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || 'Upload failed');
    error.status = response.status;
    throw error;
  }
  return { ...payload.data, url: resolveAssetUrl(payload.data?.url) };
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed');
    error.status = response.status;
    error.data = payload.data;
    throw error;
  }
  return payload;
}

const get = (path) => request(path);
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

export const authApi = {
  login(credentials) { return request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }); },
  register(details) { return request('/auth/register', { method: 'POST', body: JSON.stringify(details) }); },
  me() { return get('/auth/me'); },
  profile() { return get('/profile'); },
  updateProfile(changes) { return put('/profile', changes); },
  uploadFile,
};

export const dataApi = {
  announcements: {
    list: () => get('/announcements'),
    create: (body) => post('/announcements', body),
    update: (id, body) => put(`/announcements/${id}`, body),
    remove: (id) => del(`/announcements/${id}`),
  },
  events: {
    list: () => get('/events'),
    create: (body) => post('/events', body),
    update: (id, body) => put(`/events/${id}`, body),
    remove: (id) => del(`/events/${id}`),
  },
  quickLinks: {
    list: () => get('/quick-links'),
    create: (body) => post('/quick-links', body),
    update: (id, body) => put(`/quick-links/${id}`, body),
    remove: (id) => del(`/quick-links/${id}`),
  },
  contacts: {
    list: () => get('/hr-contacts'),
  },
  kudos: {
    list: () => get('/kudos'),
    create: (body) => post('/kudos', body),
  },
  notifications: {
    list: () => get('/notifications'),
    markRead: (id) => put(`/notifications/${id}/read`),
    markAllRead: () => put('/notifications/read-all'),
  },
  courses: { list: () => get('/courses') },
  faqs: { list: () => get('/faqs') },
  games: { list: () => get('/games') },
  dailyGames: {
    list: () => get('/daily-games'),
    stats: () => get('/daily-games/me/stats'),
    puzzle: (gameId, options = {}) => {
      const params = new URLSearchParams();
      if (options.difficulty) params.set('difficulty', options.difficulty);
      if (options.level) params.set('level', options.level);
      const query = params.toString();
      return get(`/daily-games/${gameId}/puzzle${query ? `?${query}` : ''}`);
    },
    start: (gameId, options = {}) => post(`/daily-games/${gameId}/sessions`, options),
    check: (gameId, submission, options = {}) => post(`/daily-games/${gameId}/check`, { submission, ...options }),
    hint: (gameId, options = {}) => post(`/daily-games/${gameId}/hint`, options),
    complete: (gameId, submission, options = {}) => post(`/daily-games/${gameId}/complete`, { submission, ...options }),
    leaderboard: (period = 'all') => get(`/daily-games/leaderboard?period=${encodeURIComponent(period)}`),
    champions: (period = 'all') => get(`/daily-games/champions?period=${encodeURIComponent(period)}`),
    celebrations: () => get('/daily-games/celebrations'),
    acknowledge: (eventKey) => post('/daily-games/celebrations/ack', { eventKey }),
  },
  employees: {
    list: () => get('/employees'),
    search: (query, limit = 8) => get(`/employees?q=${encodeURIComponent(String(query || '').trim())}&limit=${limit}`),
  },
  celebrations: { list: () => get('/celebrations') },
  dashboard: { summary: () => get('/dashboard/summary') },
  moods: {
    state: () => get('/moods/state'),
    save: (body) => put('/moods/today', body),
    team: () => get('/moods/team'),
    react: (id, reaction) => post(`/moods/${id}/reactions`, { reaction }),
    sendMessage: (id, body) => post(`/moods/${id}/messages`, body),
    respondToChat: (id, status) => put(`/mood-messages/${id}/chat`, { status }),
  },
};
