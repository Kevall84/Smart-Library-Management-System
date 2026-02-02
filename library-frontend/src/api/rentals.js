import { api } from './client';

export const rentalsApi = {
  create: async ({ bookId, rentalDays }) => api.post('rentals', { bookId, rentalDays }),
  my: async (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`rentals/me${suffix}`);
  },
  stats: async () => api.get('rentals/stats/me'),
  staffStats: async () => api.get('rentals/stats/staff'),
  staff: async (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`rentals${suffix}`);
  },
  overdue: async (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`rentals/overdue${suffix}`);
  },
  get: async (id) => api.get(`rentals/${id}`),
  penalty: async (id) => api.get(`rentals/${id}/penalty`),
  scan: async (qrCode) => api.post('rentals/scan', { qrCode }),
  generateReturnQr: async (id) => api.post(`rentals/${id}/generate-return-qr`, {}),
  directReturn: async (id) => api.post(`rentals/${id}/return`, {}),
};

