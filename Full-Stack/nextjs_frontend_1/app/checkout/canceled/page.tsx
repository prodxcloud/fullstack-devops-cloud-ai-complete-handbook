'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import CheckoutStatus from '@/components/CheckoutStatus';

export default function CheckoutCanceledPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <CheckoutStatus 
      sessionId={sessionId || undefined} 
      canceled={true} 
    />
  );
} 