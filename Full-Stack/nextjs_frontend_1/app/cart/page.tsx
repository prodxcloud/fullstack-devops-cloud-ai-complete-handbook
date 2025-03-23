'use client';

import React, { useEffect, useState } from 'react';
import { cartApi } from '../lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    thumbnail: string;
  };
  quantity: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  total_amount: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load cart. Please try again.');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      await cartApi.updateCartItem(productId, quantity);
      await fetchCart(); // Refresh cart after update
    } catch (err) {
      setError('Failed to update quantity. Please try again.');
      console.error('Error updating quantity:', err);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await cartApi.removeFromCart(productId);
      await fetchCart(); // Refresh cart after removal
    } catch (err) {
      setError('Failed to remove item. Please try again.');
      console.error('Error removing item:', err);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Add some items to your cart to get started!</p>
          <a
            href="/"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-gray-200 py-4"
            >
              <div className="relative w-24 h-24">
                <Image
                  src={item.product.thumbnail || '/placeholder.png'}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              
              <div className="flex-grow">
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="text-gray-600">${item.product.price.toFixed(2)}</p>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cart.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${cart.total_amount.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 