import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8585';

// Create a configured axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for cookies, authorization headers with HTTPS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });

          if (response.data.access) {
            localStorage.setItem('accessToken', response.data.access);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message;
    if (error.response?.status !== 401) {  // Don't show 401 errors as they're handled above
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Cart API with error handling
export const cartApi = {
  getCart: async () => {
    try {
      const response = await api.get('/store/carts');
      return response.data;
    } catch (error) {
      console.error('Failed to get cart:', error);
      throw error;
    }
  },

  addToCart: async (productId: string, quantity: number = 1) => {
    try {
      const response = await api.post('/store/carts/add/', { 
        product_id: productId, 
        quantity 
      });
      toast.success('Item added to cart');
      return response.data;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  },

  updateCartItem: async (productId: string, quantity: number) => {
    try {
      const response = await api.post('/store/carts/update/', { 
        product_id: productId, 
        quantity 
      });
      toast.success('Cart updated');
      return response.data;
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    }
  },

  removeFromCart: async (productId: string) => {
    try {
      const response = await api.post('/store/carts/remove/', { 
        product_id: productId 
      });
      toast.success('Item removed from cart');
      return response.data;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const response = await api.post('/store/carts/clear/');
      toast.success('Cart cleared');
      return response.data;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }
};

// Order API with error handling
export const orderApi = {
  getOrders: async () => {
    try {
      const response = await api.get('/orders/');
      return response.data;
    } catch (error) {
      console.error('Failed to get orders:', error);
      throw error;
    }
  },

  getOrder: async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to get order:', error);
      throw error;
    }
  },

  createOrder: async () => {
    try {
      const response = await api.post('/orders/');
      toast.success('Order created successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }
};

// Checkout API with error handling
export const checkoutApi = {
  createCheckoutSession: async (items: Array<{ id: string; quantity: number; price: number }>) => {
    try {
      const response = await api.post(process.env.NEXT_PUBLIC_API_CHECKOUT_URL || '', { items });
      return response.data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  }
};

export default api; 