import { create } from 'zustand';
import api from '../lib/axios';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,

  checkAuth: async () => {
    try {
      const token = localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || 'accessToken');
      if (!token) {
        set({ isAuthenticated: false, loading: false });
        return;
      }

      const response = await api.get(`${process.env.NEXT_PUBLIC_API_AUTH_URL}/user/`);
      set({ isAuthenticated: true, user: response.data, loading: false });
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || 'accessToken');
      localStorage.removeItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'refreshToken');
      set({ isAuthenticated: false, loading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_AUTH_URL}/login/`, {
        email,
        password,
      });

      const { access, refresh, user } = response.data;
      localStorage.setItem(process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || 'accessToken', access);
      localStorage.setItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'refreshToken', refresh);
      set({ isAuthenticated: true, user });
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Login failed' });
      throw error;
    }
  },

  register: async (email: string, password: string, username: string) => {
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_AUTH_URL}/register/`, {
        email,
        password,
        username,
      });

      const { access, refresh, user } = response.data;
      localStorage.setItem(process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || 'accessToken', access);
      localStorage.setItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'refreshToken', refresh);
      set({ isAuthenticated: true, user });
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Registration failed' });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || 'accessToken');
    localStorage.removeItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'refreshToken');
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuthStore; 