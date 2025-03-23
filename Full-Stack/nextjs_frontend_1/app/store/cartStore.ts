import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  thumbnail: string;
  default_price: string;
  quantity: number;
}

interface CartStore {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      
      addToCart: (item) => {
        set((state) => {
          const existingItem = state.cartItems.find((i) => i.id === item.id);
          
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          
          return {
            cartItems: [...state.cartItems, { ...item, quantity: 1 }],
          };
        });
      },
      
      removeFromCart: (itemId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== itemId),
        }));
      },
      
      updateQuantity: (itemId, quantity) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ cartItems: [] });
      },
      
      getCartTotal: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => {
          const price = parseFloat(item.default_price.split('_')[1]) / 100;
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
    }
  )
);

export default useCartStore; 