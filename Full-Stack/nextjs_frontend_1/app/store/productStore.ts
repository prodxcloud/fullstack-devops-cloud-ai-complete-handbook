import { create } from 'zustand';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  stripe_product_id: string;
  name: string;
  desc: string;
  active: boolean;
  default_price: string | null | number;
  thumbnail: string;
  quantity: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  price?: number;
}

interface CartItem extends Product {
  cartQuantity: number;
}

interface ProductState {
  products: Product[];
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  fetchProducts: () => Promise<void>;
  fetchProductDetails: (productId: string) => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  initiateCheckout: (items: CartItem[]) => Promise<string>;
  buyNow: (product: Product) => Promise<string>;
  resetError: () => void;
}

const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  cartItems: [],
  loading: false,
  error: null,
  selectedProduct: null,

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      
      // Using the correct store/products endpoint
      const response = await api.get('http://localhost:8585/api/v1/store/products/');
      
      console.log('Products Response:', response.data);
      
      // Check if the response has results property (paginated response)
      const products = response.data.results || response.data;
      set({ products, loading: false });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch products';
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
    }
  },

  fetchProductDetails: async (productId: string) => {
    try {
      set({ loading: true, error: null });
      
      // Using the correct endpoint for product details
      const response = await api.post('http://localhost:8585/api/v1/store/products/id/', {
        id: productId
      });
      
      // Check if the response has a data property
      const product = response.data.data || response.data;
      set({ selectedProduct: product, loading: false });
    } catch (error: any) {
      console.error('Error fetching product details:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch product details';
      set({
        error: errorMessage,
        loading: false
      });
      toast.error(errorMessage);
    }
  },

  addToCart: (product: Product) => {
    try {
      const { cartItems } = get();
      const existingItem = cartItems.find(item => item.id === product.id);

      if (existingItem) {
        set({
          cartItems: cartItems.map(item =>
            item.id === product.id
              ? { ...item, cartQuantity: item.cartQuantity + 1 }
              : item
          )
        });
      } else {
        set({
          cartItems: [...cartItems, { ...product, cartQuantity: 1 }]
        });
      }
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(get().cartItems));
      toast.success(`${product.name} added to cart`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      set({ error: 'Failed to add item to cart' });
      toast.error('Failed to add item to cart');
    }
  },

  removeFromCart: (productId: string) => {
    try {
      const { cartItems } = get();
      set({
        cartItems: cartItems.filter(item => item.id !== productId)
      });
      
      // Update localStorage
      localStorage.setItem('cart', JSON.stringify(get().cartItems));
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      set({ error: 'Failed to remove item from cart' });
      toast.error('Failed to remove item from cart');
    }
  },

  updateCartQuantity: (productId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        toast.error('Quantity must be at least 1');
        return;
      }
      
      const { cartItems } = get();
      set({
        cartItems: cartItems.map(item =>
          item.id === productId
            ? { ...item, cartQuantity: Math.max(1, quantity) }
            : item
        )
      });
      
      // Update localStorage
      localStorage.setItem('cart', JSON.stringify(get().cartItems));
      toast.success('Cart updated');
    } catch (error: any) {
      console.error('Error updating cart quantity:', error);
      set({ error: 'Failed to update cart quantity' });
      toast.error('Failed to update cart quantity');
    }
  },

  clearCart: () => {
    try {
      set({ cartItems: [] });
      localStorage.removeItem('cart');
      toast.success('Cart cleared');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      set({ error: 'Failed to clear cart' });
      toast.error('Failed to clear cart');
    }
  },

  initiateCheckout: async (items: CartItem[]) => {
    try {
      set({ loading: true, error: null });
      
      if (items.length === 0) {
        throw new Error('Cart is empty');
      }
      
      const response = await api.post(
        'http://localhost:8585/api/v1/store/checkout/',
        { 
          items: items.map(item => ({ 
            id: item.id, 
            quantity: item.cartQuantity,
            price: item.price || item.default_price || 0
          })) 
        }
      );

      // Store order ID for later reference
      if (response.data.order_id) {
        localStorage.setItem('pending_order_id', response.data.order_id);
      }

      set({ loading: false });
      return response.data.checkout_url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create checkout session';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  buyNow: async (product: Product) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post(
        'http://localhost:8585/api/v1/store/checkout/',
        { 
          items: [{
            id: product.id,
            quantity: 1,
            price: product.price || product.default_price || 0
          }] 
        }
      );

      // Store order ID for later reference
      if (response.data.order_id) {
        localStorage.setItem('pending_order_id', response.data.order_id);
      }

      set({ loading: false });
      return response.data.checkout_url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create checkout session';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
  
  resetError: () => {
    set({ error: null });
  }
}));

export default useProductStore; 