import { api } from './client';

export const qrApi = {
  byRental: async (rentalId, type = 'issue') => api.get(`qr/rental/${rentalId}?type=${type}`),
};

