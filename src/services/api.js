/**
 * Future API boundary. Components should call this adapter rather than fetch from
 * individual UI components. The current prototype returns local demo data only.
 * Replace these methods with fetch/HTTP calls when the Express API is available.
 */
export const demoApi = {
  async list(resource, fallback = []) { return Promise.resolve(fallback); },
  async create(resource, item) { return Promise.resolve({ ...item, id: item.id || `${resource}-${Date.now()}` }); },
  async update(resource, id, changes) { return Promise.resolve({ id, ...changes }); },
  async remove(resource, id) { return Promise.resolve({ id, removed: true }); },
};

// Suggested future integration: use import.meta.env.VITE_API_BASE_URL and a
// shared fetch wrapper here. Do not fake successful production API requests.
