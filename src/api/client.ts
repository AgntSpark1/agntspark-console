import axios, { AxiosError, AxiosInstance } from 'axios';

// agntspark-gateway serves bare /v1 (no /api prefix) — matches
// agntspark-sdk's default base_url. The dev-only proxy below forwards
// this same /v1 prefix straight to the local gateway.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token from localStorage on every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agntspark_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Normalize errors so callers get a consistent shape
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; detail?: string }>) => {
    const detail =
      error.response?.data?.message ??
      error.response?.data?.detail ??
      error.message ??
      'An unexpected error occurred';
    return Promise.reject(new Error(detail));
  },
);

export { apiClient };
export default apiClient;
