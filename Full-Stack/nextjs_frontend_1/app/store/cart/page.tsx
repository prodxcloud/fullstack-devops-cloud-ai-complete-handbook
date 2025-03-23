'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CartList from '@/components/CartList';
import toast from 'react-hot-toast';

export default function StoreCartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [redirected, setRedirected] = useState(false);

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user && !redirected) {
      setRedirected(true); // Prevent multiple redirects
      toast.error('Please log in to view your cart');
      router.push('/auth/login');
    }
  }, [user, authLoading, router, redirected]);

  // If still loading auth or not authenticated, show loading or nothing
  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 4 }}>
        Your Shopping Cart
      </Typography>
      <CartList />
    </Container>
  );
} 