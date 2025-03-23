'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CheckoutStatus from '@/components/CheckoutStatus';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

export default function CheckoutCanceledPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { syncCart } = useCart();
  
  // Sync cart when checkout is canceled
  useEffect(() => {
    const handleCanceledCheckout = async () => {
      try {
        // Sync cart to ensure it's up to date after canceled checkout
        await syncCart();
        toast.info('Checkout was canceled. Your cart has been preserved.');
      } catch (error) {
        console.error('Error syncing cart after canceled checkout:', error);
      }
    };
    
    handleCanceledCheckout();
  }, [syncCart]);

  return (
    <CheckoutStatus 
      sessionId={sessionId || undefined} 
      canceled={true} 
    />
  );
} 