import { api } from './client';

export const booksApi = {
  list: async (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`books${suffix}`);
  },
  get: async (id) => api.get(`books/${id}`),
  create: async (data) => api.post('books', data),
  update: async (id, data) => api.put(`books/${id}`, data),
  delete: async (id) => api.del(`books/${id}`),
};

