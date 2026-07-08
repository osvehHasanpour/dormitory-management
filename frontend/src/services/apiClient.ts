import axios from "axios";

import { refreshTokens } from "./authService";

const ACCESS_TOKEN_KEY = "dormitory_access_token";
const REFRESH_TOKEN_KEY = "dormitory_refresh_token";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

function readAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

function readRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeTokens(tokens: { access: string; refresh?: string }) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    if (tokens.refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    }
  } catch {
    // ignore storage failures
  }
}

function clearStoredTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore storage failures
  }
}

let refreshPromise: Promise<string> | null = null;
let isRefreshing = false;

type PendingRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let pendingQueue: PendingRequest[] = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
}

apiClient.interceptors.request.use((config) => {
  const existing = config.headers?.Authorization;
  if (existing) return config;

  const token = readAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;

    const status = error?.response?.status;
    const url: string | undefined = originalRequest?.url;

    const isAuthEndpoint =
      typeof url === "string" &&
      (url.includes("/v1/auth/login/") ||
        url.includes("/v1/auth/token/refresh/") ||
        url.includes("/v1/auth/logout/"));

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = readRefreshToken();
    if (!refreshToken) {
      clearStoredTokens();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    refreshPromise =
      refreshPromise ??
      refreshTokens(refreshToken)
        .then((tokens) => {
          writeTokens(tokens);
          flushQueue(null, tokens.access);
          return tokens.access;
        })
        .catch((refreshError) => {
          clearStoredTokens();
          flushQueue(refreshError, null);
          throw refreshError;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });

    const newAccess = await refreshPromise;
    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
    return apiClient(originalRequest);
  },
);

export default apiClient;
