const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
export const TOKEN_KEY = 'hrobit-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!formData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData ? formData : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const error = new Error(data.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  login: (email) => request('/auth/login', { method: 'POST', body: { email } }),
  me: () => request('/auth/me'),
  updateProfile: (payload) => request('/profile', { method: 'PUT', body: payload }),
  employees: () => request('/employees'),
  celebrations: () => request('/celebrations'),
  hrContacts: () => request('/hr-contacts'),
  announcements: () => request('/announcements'),
  createAnnouncement: (body) => request('/announcements', { method: 'POST', body }),
  updateAnnouncement: (id, body) => request(`/announcements/${id}`, { method: 'PUT', body }),
  deleteAnnouncement: (id) => request(`/announcements/${id}`, { method: 'DELETE' }),
  events: () => request('/events'),
  createEvent: (body) => request('/events', { method: 'POST', body }),
  updateEvent: (id, body) => request(`/events/${id}`, { method: 'PUT', body }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  quickLinks: () => request('/quick-links'),
  createQuickLink: (body) => request('/quick-links', { method: 'POST', body }),
  updateQuickLink: (id, body) => request(`/quick-links/${id}`, { method: 'PUT', body }),
  deleteQuickLink: (id) => request(`/quick-links/${id}`, { method: 'DELETE' }),
  kudos: () => request('/kudos'),
  createKudo: (body) => request('/kudos', { method: 'POST', body }),
  notifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  courses: () => request('/courses'),
  faqs: () => request('/faqs'),
  games: () => request('/games'),
  dashboardSummary: () => request('/dashboard/summary'),
};

export async function settledData(promise, fallback = []) {
  try {
    const result = await promise;
    const payload = result?.data ?? result?.user ?? result;
    if (Array.isArray(fallback)) {
      return Array.isArray(payload) && payload.length ? payload : fallback;
    }
    return payload || fallback;
  } catch {
    return fallback;
  }
}
