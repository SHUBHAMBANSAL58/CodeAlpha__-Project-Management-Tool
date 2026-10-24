// Axios client for the Express API (milestone 2). The base URL comes from
// VITE_API_URL so development and production builds talk to the right server.
import axios from 'axios';
import { ApiError } from './ApiError';
import { tokenStorage } from './tokenStorage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data ?? {};
    const message = body.message ?? (status === 0 ? 'Unable to reach the server. Check your connection.' : 'Something went wrong');
    return Promise.reject(new ApiError(status, message, body.errors));
  },
);
