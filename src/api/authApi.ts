/**
 * Authentication and Coach profile API endpoints
 */

import { apiClient } from './client';
import { Coach, LoginRequest, LoginResponse } from '../interface';
import { routes } from './routes';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      routes.login,
      credentials,
    );
    return response.data;
  },

  getMe: async (): Promise<Coach> => {
    const response = await apiClient.get<Coach>(routes.me);
    return response.data;
  },
};
