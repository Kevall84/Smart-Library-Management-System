import { api } from './client';

export const ebooksApi = {
  search: async ({ q, source = 'openlibrary', page = 1, limit = 20 }) =>
    api.get(`ebooks/search?q=${encodeURIComponent(q)}&source=${encodeURIComponent(source)}&page=${page}&limit=${limit}`),
  details: async ({ externalId, source }) =>
    api.get(`ebooks/${encodeURIComponent(externalId)}?source=${encodeURIComponent(source)}`),
};

