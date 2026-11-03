/**
 * API boundary for the HROrbit Express backend.
 * Business data is fetched from the backend and PostgreSQL.
 */
// Deployed builds without VITE_API_URL call the backend on the same domain (/api).
const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : ''))
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');

// Provider URLs used by the games.
export const GAME_APIS = Object.freeze({
  sudoku: 'https://sudoku-api.vercel.app/api/dosuku',
  quiz: 'https://opentdb.com/api.php?amount=10&type=multiple',
  word: 'https://api.datamuse.com/words?ml=game&max=10',
  trivia: 'https://the-trivia-api.com/v2/questions?limit=10',
});

export function getToken() {
  return localStorage.getItem('hrobit-auth-token');
}

// AppContext listens for this and sends the user back to the login page.
export const SESSION_EXPIRED_EVENT = 'hrobit:session-expired';

/** When the JWT expires (ms since epoch), read from its payload; null if unreadable. Timing only — the server still decides. */
export function tokenExpiresAt(token) {
  try {
    const payload = JSON.parse(atob(String(token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Number.isFinite(payload.exp) ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// A 401 on a request that carried a token means the session is over (24h expiry, a
// revoked token, or the user left the office network — code 'network'). A wrong
// password at sign-in is a normal form error instead.
function reportExpiredSession(status, hadToken, path, code) {
  if (status === 401 && hadToken && path !== '/auth/login') {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { reason: code === 'network' ? 'network' : 'expired' } }));
  }
}

/**
 * Convert backend-relative media paths to absolute URLs.
 */
export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return null;

  if (
    /^(https?:)?\/\//i.test(url) ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
}

/**
 * Upload a file using the existing upload endpoint.
 */
async function uploadFile(file) {
  const token = getToken();
  const formData = new FormData();

  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    reportExpiredSession(response.status, Boolean(token), '/upload', payload.code);
    const error = new Error(payload.message || 'Upload failed');
    error.status = response.status;
    error.code = payload.code;
    throw error;
  }

  return {
    ...payload.data,
    url: resolveAssetUrl(payload.data?.url),
  };
}

/**
 * Shared authenticated API request helper.
 */
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
    reportExpiredSession(response.status, Boolean(token), path, payload.code);
    const error = new Error(payload.message || 'Request failed');
    error.status = response.status;
    error.code = payload.code;
    error.data = payload.data;
    throw error;
  }

  return payload;
}

const get = (path) => request(path);

const post = (path, body) =>
  request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });

const put = (path, body) =>
  request(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

const del = (path) =>
  request(path, {
    method: 'DELETE',
  });

export const chatbotApi = {
  ask(question, conversation = []) {
    return post('/chatbot/ask', { question, conversation });
  },

  employeesOnLeave() {
    return get('/chatbot/employees-on-leave');
  },
};

// Authentication APIs
export const authApi = {
  // Email + password, verified against the company Microsoft account.
  login(email, password) {
    return post('/auth/login', { email, password });
  },

  me() {
    return get('/auth/me');
  },

  // 401 (code 'network') once the user is off the office Wi-Fi/VPN.
  networkCheck() {
    return get('/auth/network-check');
  },

  profile() {
    return get('/profile');
  },

  updateProfile(changes) {
    return put('/profile', changes);
  },

  uploadFile,
};

// Dashboard data APIs
export const dataApi = {
  announcements: {
    list: ({ includePast = false } = {}) => get(includePast ? '/announcements?includePast=true' : '/announcements'),
    create: (body) => post('/announcements', body),
    update: (id, body) => put(`/announcements/${id}`, body),
    remove: (id) => del(`/announcements/${id}`),
  },

  events: {
    list: () => get('/events'),
    create: (body) => post('/events', body),
    update: (id, body) => put(`/events/${id}`, body),
    remove: (id) => del(`/events/${id}`),
    // holidayId is the numeric part of "holiday-12"; an empty image restores the default cover.
    setHolidayCover: (holidayId, image) => put(`/events/holiday/${holidayId}/cover`, { image }),
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
    markAllRead: (notificationIds) => put('/notifications/read-all', { notificationIds }),
  },

  courses: {
    list: () => get('/courses'),
  },

  faqs: {
    list: () => get('/faqs'),
  },

  games: {
    list: () => get('/games'),
  },

  dailyGames: {
    list: () => get('/daily-games'),

    stats: () => get('/daily-games/me/stats'),

    puzzle: (gameId, options = {}) => {
      const params = new URLSearchParams();

      if (options.difficulty) {
        params.set('difficulty', options.difficulty);
      }

      if (options.level) {
        params.set('level', options.level);
      }

      const query = params.toString();

      return get(
        `/daily-games/${gameId}/puzzle${query ? `?${query}` : ''}`
      );
    },

    start: (gameId, options = {}) =>
      post(`/daily-games/${gameId}/sessions`, options),

    check: (gameId, submission, options = {}) =>
      post(`/daily-games/${gameId}/check`, {
        submission,
        ...options,
      }),

    hint: (gameId, options = {}) =>
      post(`/daily-games/${gameId}/hint`, options),

    complete: (gameId, submission, options = {}) =>
      post(`/daily-games/${gameId}/complete`, {
        submission,
        ...options,
      }),

    leaderboard: (period = 'all') =>
      get(
        `/daily-games/leaderboard?period=${encodeURIComponent(period)}`
      ),

    champions: (period = 'all') =>
      get(
        `/daily-games/champions?period=${encodeURIComponent(period)}`
      ),

    celebrations: () => get('/daily-games/celebrations'),

    acknowledge: (eventKey) =>
      post('/daily-games/celebrations/ack', { eventKey }),
  },

  employees: {
    list: () => get('/employees'),

    search: (query, limit = 8) =>
      get(
        `/employees?q=${encodeURIComponent(
          String(query || '').trim()
        )}&limit=${limit}`
      ),
  },

  // NEW: Fetch birthdays directly from the backend database query.
  birthdays: {
    today: (month, day) =>
      get(
        `/birthdays/today?month=${encodeURIComponent(month)}&day=${encodeURIComponent(day)}`
      ),
    markRead: (employeeId) => put(`/birthdays/${encodeURIComponent(employeeId)}/read`),
    markAllRead: (employeeIds) => put('/birthdays/read-all', { employeeIds }),
  },

  celebrations: {
    list: () => get('/celebrations'),
  },

  dashboard: {
    summary: () => get('/dashboard/summary'),
  },

  moods: {
    state: () => get('/moods/state'),
    save: (body) => put('/moods/today', body),
    team: () => get('/moods/team'),
    react: (id, reaction) =>
      post(`/moods/${id}/reactions`, { reaction }),
    toggleLike: (id) =>
      post(`/moods/${id}/like`, {}),
    messages: () => get('/mood-messages'),
    sendMessage: (id, body) =>
      post(`/moods/${id}/messages`, body),
    respondToChat: (id, status) =>
      put(`/mood-messages/${id}/chat`, { status }),
  },
};