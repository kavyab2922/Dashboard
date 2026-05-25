import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const employeesAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  getDepartments: () => api.get('/employees/departments'),
  update: (id, data) => api.put(`/employees/${id}`, data),
  add: (data) => api.post('/employees', data),
  remove: (id) => api.delete(`/employees/${id}`),
};

export const achievementsAPI = {
  getAll: (params) => api.get('/achievements', { params }),
  getCategories: () => api.get('/achievements/categories'),
  like: (id) => api.post(`/achievements/${id}/like`),
};

export const celebrationsAPI = {
  getAll: () => api.get('/celebrations'),
  getUpcoming: (days = 30) => api.get('/celebrations/upcoming', { params: { days } }),
};

export const policiesAPI = {
  getAll: (params) => api.get('/policies', { params }),
  getById: (id) => api.get(`/policies/${id}`),
  getCategories: () => api.get('/policies/categories'),
};

export const announcementsAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  getCategories: () => api.get('/announcements/categories'),
  like: (id) => api.post(`/announcements/${id}/like`),
  create: (data) => api.post('/announcements', data),
};

export const kudosAPI = {
  getAll: (params) => api.get('/kudos', { params }),
  create: (data) => api.post('/kudos', data),
  like: (id) => api.post(`/kudos/${id}/like`),
  getLeaderboard: () => api.get('/kudos/leaderboard'),
};

export const feedbackAPI = {
  getAll: () => api.get('/feedback'),
  submit: (data) => api.post('/feedback', data),
};

export const leavesAPI = {
  getAll: (params) => api.get('/leaves', { params }),
  apply: (data) => api.post('/leaves', data),
  updateStatus: (id, status, approvedBy) => api.put(`/leaves/${id}/status`, { status, approvedBy }),
};

export const analyticsAPI = {
  get: () => api.get('/analytics'),
};

export const pulseAPI = {
  get: () => api.get('/pulse'),
  checkin: (data) => api.post('/pulse/checkin', data),
};

export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
};

export const journeysAPI = {
  getAll: () => api.get('/journeys'),
  getByEmployee: (id) => api.get(`/journeys/${id}`),
};

export const fridayAPI = {
  // Suggestions
  getSuggestions: (params) => api.get('/friday/suggestions', { params }),
  submitSuggestion: (data) => api.post('/friday/suggestions', data),
  updateSuggestion: (id, data) => api.patch(`/friday/suggestions/${id}`, data),
  deleteSuggestion: (id) => api.delete(`/friday/suggestions/${id}`),
  // Polls
  getPolls: (params) => api.get('/friday/polls', { params }),
  getActivePoll: () => api.get('/friday/polls/active'),
  createPoll: (data) => api.post('/friday/polls', data),
  vote: (pollId, data) => api.post(`/friday/polls/${pollId}/vote`, data),
  updatePoll: (id, data) => api.patch(`/friday/polls/${id}`, data),
  deletePoll: (id) => api.delete(`/friday/polls/${id}`),
};

export default api;
