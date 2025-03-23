'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8585';
const AUTH_URL = process.env.NEXT_PUBLIC_API_AUTH_URL || `${API_URL}/api/v1/auth`;

interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_joined?: string;
  last_login?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username?: string,
    phone?: string
  ) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await axios.get(`${AUTH_URL}/profile/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post(`${AUTH_URL}/login/`, { 
        email, 
        password 
      });
      
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      setUser(userData);
      router.push('/products');
    } catch (err: any) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const googleLoginHandler = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      try {
        console.log('Google login success:', codeResponse);
        
        // Send the authorization code to your backend
        const backendResponse = await axios.post(`${AUTH_URL}/google/`, {
          credential: codeResponse.code,
          redirect_uri: 'http://localhost:3000/auth/google/callback'
        });

        console.log('Backend response:', backendResponse.data);

        const { access, refresh, user: userData } = backendResponse.data;

        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);

        setUser(userData);
        router.push('/products');
      } catch (err: any) {
        console.error('Google login failed:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Google login failed';
        setError(errorMessage);
        throw err;
      }
    },
    onError: (errorResponse) => {
      console.error('Google login error:', errorResponse);
      setError('Failed to login with Google');
      throw errorResponse;
    },
    scope: 'email profile',
    redirect_uri: 'http://localhost:3000/auth/google/callback'
  });

  const googleLogin = async () => {
    try {
      await googleLoginHandler();
    } catch (err) {
      throw err;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username?: string,
    phone?: string
  ) => {
    try {
      setError(null);
      const response = await axios.post(`${AUTH_URL}/register/`, {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        username,
        phone,
      });
      
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      setUser(userData);
      router.push('/products');
    } catch (err: any) {
      console.error('Registration failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        googleLogin,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 