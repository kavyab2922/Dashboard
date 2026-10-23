/**
 * API boundary for the HROrbit Express backend. All business data is fetched
 * from the backend (PostgreSQL via the API); no local demo data lives here.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getToken() {
  return localStorage.getItem('hrobit-auth-token');
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
  updateProfile(changes) { return put('/profile', changes); },
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
  employees: { list: () => get('/employees') },
  celebrations: { list: () => get('/celebrations') },
  dashboard: { summary: () => get('/dashboard/summary') },
};
