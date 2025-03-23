'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import CheckoutStatus from '@/components/CheckoutStatus';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutStatus 
        status="success"
        orderId={orderId || undefined}
        message="Thank you for your purchase! We'll send you an email with your order details."
      />
    </div>
  );
} 