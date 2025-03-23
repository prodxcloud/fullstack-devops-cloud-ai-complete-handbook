'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CheckoutStatus from '@/components/CheckoutStatus';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { syncCart } = useCart();
  
  // Sync cart when checkout is successful
  useEffect(() => {
    const handleSuccessfulCheckout = async () => {
      try {
        // Sync cart to ensure it's up to date after checkout
        await syncCart();
        toast.success('Order completed successfully!');
      } catch (error) {
        console.error('Error syncing cart after checkout:', error);
      }
    };
    
    handleSuccessfulCheckout();
  }, [syncCart]);

  return (
    <CheckoutStatus 
      sessionId={sessionId || undefined} 
      success={true} 
    />
  );
} 