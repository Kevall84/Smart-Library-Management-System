import { api } from './client';

export const paymentsApi = {
  config: async () => api.get('payments/config'),
  my: async (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`payments/me${suffix}`);
  },
  get: async (id) => api.get(`payments/${id}`),
  verifyRazorpay: async (payload) => api.post('payments/verify/razorpay', payload),
};

