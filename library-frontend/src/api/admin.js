import { api } from './client';

export const adminApi = {
  users: async (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`admin/users${suffix}`);
  },
  createStaff: async (payload) => api.post('admin/staff', payload),
  setUserActive: async (id, isActive) => api.patch(`admin/users/${id}/active`, { isActive }),
  pricing: async () => api.get('admin/pricing'),
  auditLogs: async (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`admin/audit-logs${suffix}`);
  },
  dashboard: async () => api.get('admin/analytics/dashboard'),
  rentalsStats: async (days = 30) => api.get(`admin/analytics/rentals?days=${days}`),
  revenueStats: async (days = 30) => api.get(`admin/analytics/revenue?days=${days}`),
  overdueReport: async () => api.get('admin/analytics/overdue-report'),
  popularBooks: async (limit = 10) => api.get(`admin/analytics/popular-books?limit=${limit}`),
  categories: async () => api.get('admin/analytics/categories'),
};

