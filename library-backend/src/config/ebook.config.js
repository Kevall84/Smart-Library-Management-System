import axios from 'axios';
import config from './env.js';

/**
 * External free eBook API base URLs & keys
 */

export const openLibraryClient = axios.create({
  baseURL: config.OPEN_LIBRARY_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gutenbergClient = axios.create({
  baseURL: config.GUTENBERG_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  openLibraryClient,
  gutenbergClient,
  OPEN_LIBRARY_BASE_URL: config.OPEN_LIBRARY_BASE_URL,
  GUTENBERG_BASE_URL: config.GUTENBERG_BASE_URL,
};
