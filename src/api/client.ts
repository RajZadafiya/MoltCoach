/**
 * Axios client configured for Molt Coach backend
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiErrorBody } from '../interface';
import { isAndroid, TOKEN_STORAGE_KEY } from 'globals';

export const BASE_URL = isAndroid
  ? 'http://10.0.2.2:4000'
  : 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorizedCallback = cb;
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(
  error: unknown,
  fallback: string = 'An unexpected error occurred.',
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.error?.message) {
      return data.error.message;
    }
    if (error.response?.status === 503) {
      return 'Service temporarily unavailable. Please try again.';
    }
    if (error.response?.status === 401) {
      return 'Invalid credentials or session expired.';
    }
    if (error.response?.status === 404) {
      return 'Resource not found.';
    }
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      return 'Cannot connect to server. Ensure mock server is running on port 4000.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
