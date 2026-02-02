import { api } from './client';

export const authApi = {
  login: async (email, password) => api.post('auth/login', { email, password }),
  register: async (payload) => api.post('auth/register', payload),
  me: async () => api.get('auth/me'),
  updateProfile: async (payload) => api.put('auth/profile', payload),
  changePassword: async (payload) => api.put('auth/change-password', payload),
  logout: async () => api.post('auth/logout', {}),
};

