import { apiRequest } from './queryClient';
import { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, name: string, password: string): Promise<User> {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
  },

  async logout(): Promise<void> {
    return apiRequest('/api/auth/logout', { method: 'POST' });
  },

  async getMe(): Promise<User> {
    return apiRequest('/api/auth/me');
  },
};