'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const initialized = useRef(false);

  const fetchCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/store/carts');
      if (response.data && Array.isArray(response.data.items)) {
        setCart(response.data.items);
      } else {
        console.warn('Unexpected cart data format:', response.data);
        setCart([]);
      }
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load cart. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart data when user logs in or component mounts
  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/store/carts/add/', {
        product_id: productId,
        quantity,
      });
      
      if (response.data && Array.isArray(response.data.items)) {
        setCart(response.data.items);
        toast.success('Item added to cart');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add item to cart';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to remove items from cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/store/carts/remove/', {
        product_id: productId,
      });
      
      if (response.data && Array.isArray(response.data.items)) {
        setCart(response.data.items);
      } else {
        setCart(prev => prev.filter(item => item.product_id !== productId));
      }
      toast.success('Item removed from cart');
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove item from cart';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) {
      toast.error('Please log in to update cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/store/carts/update/', {
        product_id: productId,
        quantity,
      });
      
      if (response.data && Array.isArray(response.data.items)) {
        setCart(response.data.items);
        toast.success('Cart updated');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error updating cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update cart';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) {
      toast.error('Please log in to clear cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.post('/store/carts/clear/');
      setCart([]);
      toast.success('Cart cleared');
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to clear cart';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/store/carts');
      setCart(response.data.items || []);
    } catch (err: any) {
      console.error('Error syncing cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to sync cart';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 