import axios, { AxiosError, AxiosInstance } from 'axios';

// agntspark-gateway serves bare /v1 (no /api prefix) — matches
// agntspark-sdk's default base_url. The dev-only proxy in vite.config.ts
// forwards this same /v1 prefix straight to the local gateway.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/v1';

export const TOKEN_STORAGE_KEY = 'agntspark_token';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Normalize errors so callers get a consistent shape. The gateway's error
// envelope is {code, message, details} (agntspark_core AgntSparkError.to_dict).
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; detail?: string }>) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/') ?? false;
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Session expired / token revoked — drop it and send the user back to
      // login rather than rendering a page full of failed queries.
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

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
