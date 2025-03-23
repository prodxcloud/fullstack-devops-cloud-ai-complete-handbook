import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || 'accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there hasn't been a retry yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          process.env.NEXT_PUBLIC_API_REFRESH_TOKEN_URL || '',
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem(process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || 'accessToken', access);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY || 'accessToken');
        localStorage.removeItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 