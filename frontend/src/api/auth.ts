import { apiClient } from './client';
import { UserRole } from '@/types';

export interface LoginPayload {
  username: string;
  password?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
  status: string;
  organization?: string;
  badge?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
}

export const authApi = {
  login: async (username: string, password?: string): Promise<TokenResponse> => {
    // If password not supplied, use default enclave passwords
    const pwd = password || (username.toLowerCase().includes('examiner') ? 'Examiner@2026!' : 'Supervisor@2026!');
    const res = await apiClient.post<TokenResponse>('/auth/login', { username, password: pwd });
    return res.data;
  },

  getMe: async (): Promise<UserInfo> => {
    const res = await apiClient.get<UserInfo>('/auth/me');
    return res.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>('/auth/logout');
      return res.data;
    } catch {
      return { success: true, message: 'Logged out' };
    }
  }
};
