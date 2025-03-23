import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SyncIcon from '@mui/icons-material/Sync';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const CartList: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, isLoading, syncCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncingCart, setSyncingCart] = useState(false);
  const isMounted = useRef(true);
  const syncInitiated = useRef(false);
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});

  // Initialize local quantities from cart
  useEffect(() => {
    const quantities: Record<string, number> = {};
    cart.forEach(item => {
      quantities[item.id] = item.quantity;
    });
    setLocalQuantities(quantities);
  }, [cart]);

  useEffect(() => {
    isMounted.current = true;
    
    const initCart = async () => {
      if (syncInitiated.current) return;
      
      try {
        syncInitiated.current = true;
        setSyncingCart(true);
        await syncCart();
      } catch (err) {
        console.error('Error initializing cart:', err);
        if (isMounted.current) {
          setError('Failed to load cart. Please try refreshing the page.');
        }
      } finally {
        if (isMounted.current) {
          setSyncingCart(false);
        }
        syncInitiated.current = false;
      }
    };

    initCart();
    
    return () => {
      isMounted.current = false;
    };
  }, [syncCart]);

  const handleQuantityInputChange = useCallback((productId: string, value: string) => {
    const newQuantity = parseInt(value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setLocalQuantities(prev => ({
        ...prev,
        [productId]: newQuantity
      }));
    }
  }, []);

  const handleQuantityInputBlur = useCallback(async (productId: string) => {
    const newQuantity = localQuantities[productId];
    if (newQuantity && newQuantity > 0) {
      try {
        setLoading(true);
        await updateQuantity(productId, newQuantity);
      } catch (err) {
        console.error('Error updating quantity:', err);
        if (isMounted.current) {
          setError('Failed to update quantity. Please try again.');
        }
        toast.error('Failed to update quantity');
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }
  }, [localQuantities, updateQuantity]);

  const handleQuantityButtonClick = useCallback(async (productId: string, delta: number) => {
    const currentQuantity = localQuantities[productId] || 1;
    const newQuantity = Math.max(1, currentQuantity + delta);
    
    setLocalQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));

    try {
      setLoading(true);
      await updateQuantity(productId, newQuantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
      if (isMounted.current) {
        setError('Failed to update quantity. Please try again.');
      }
      toast.error('Failed to update quantity');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [localQuantities, updateQuantity]);

  const handleRemoveItem = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      await removeFromCart(productId);
      setLocalQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[productId];
        return newQuantities;
      });
    } catch (err) {
      console.error('Error removing item:', err);
      if (isMounted.current) {
        setError('Failed to remove item. Please try again.');
      }
      toast.error('Failed to remove item');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [removeFromCart]);

  const handleClearCart = useCallback(async () => {
    try {
      setLoading(true);
      await clearCart();
      setLocalQuantities({});
      toast.success('Cart cleared');
    } catch (err) {
      console.error('Error clearing cart:', err);
      if (isMounted.current) {
        setError('Failed to clear cart. Please try again.');
      }
      toast.error('Failed to clear cart');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [clearCart]);

  const handleSyncCart = useCallback(async () => {
    try {
      setSyncingCart(true);
      await syncCart();
      toast.success('Cart synchronized');
    } catch (err) {
      console.error('Error syncing cart:', err);
      if (isMounted.current) {
        setError('Failed to sync cart. Please try again.');
      }
      toast.error('Failed to sync cart');
    } finally {
      if (isMounted.current) {
        setSyncingCart(false);
      }
    }
  }, [syncCart]);

  const handleCheckout = useCallback(async () => {
    if (!user) {
      toast.error('Please log in to checkout');
      router.push('/auth/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/store/checkout/', {
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      });

      if (response.data.checkout_url) {
        localStorage.setItem('pending_order_id', response.data.order_id);
        window.location.href = response.data.checkout_url;
      } else {
        if (isMounted.current) {
          setError('Checkout failed. Please try again.');
        }
        toast.error('Checkout failed');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      if (isMounted.current) {
        setError('Failed to initiate checkout. Please try again.');
      }
      toast.error('Failed to initiate checkout');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [cart, user, router]);

  const calculateTotal = useCallback(() => {
    if (!cart) return 0;
    return cart.reduce((total, item) => {
      let price = 0;
      if (typeof item.default_price === 'string' && item.default_price.includes('_')) {
        price = parseFloat(item.default_price.split('_')[1]) / 100;
      } else if (typeof item.default_price === 'number') {
        price = item.default_price / 100;
      } else if (typeof item.default_price === 'string') {
        price = parseFloat(item.default_price);
      }
      return total + (price * (localQuantities[item.id] || item.quantity));
    }, 0);
  }, [cart, localQuantities]);

  if (isLoading || syncingCart) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1">Loading cart...</Typography>
      </Box>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Your cart is empty</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/store/products')}
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Paper sx={{ maxWidth: 600, margin: 'auto', mt: 4, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Shopping Cart
        </Typography>
        <Button
          startIcon={<SyncIcon />}
          onClick={handleSyncCart}
          disabled={syncingCart}
          size="small"
        >
          Sync
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <List>
        {cart.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem
              sx={{ py: 2 }}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={loading}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar
                  src={item.thumbnail}
                  alt={item.name}
                  sx={{ width: 56, height: 56 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityButtonClick(item.id, -1)}
                        disabled={localQuantities[item.id] <= 1 || loading}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <TextField
                        size="small"
                        value={localQuantities[item.id] || item.quantity}
                        onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                        onBlur={() => handleQuantityInputBlur(item.id)}
                        inputProps={{ 
                          min: 1, 
                          style: { textAlign: 'center', width: '40px' } 
                        }}
                        variant="outlined"
                        disabled={loading}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityButtonClick(item.id, 1)}
                        disabled={loading}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', mt: 1 }}>
                      Price: ${typeof item.default_price === 'string' && item.default_price.includes('_') 
                        ? (parseFloat(item.default_price.split('_')[1]) / 100).toFixed(2)
                        : typeof item.default_price === 'number' 
                          ? (item.default_price / 100).toFixed(2)
                          : parseFloat(item.default_price).toFixed(2)}
                    </Typography>
                    <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                      Subtotal: ${typeof item.default_price === 'string' && item.default_price.includes('_')
                        ? ((parseFloat(item.default_price.split('_')[1]) / 100) * (localQuantities[item.id] || item.quantity)).toFixed(2)
                        : typeof item.default_price === 'number'
                          ? ((item.default_price / 100) * (localQuantities[item.id] || item.quantity)).toFixed(2)
                          : (parseFloat(item.default_price) * (localQuantities[item.id] || item.quantity)).toFixed(2)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < cart.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        <Typography variant="h6">
          Total: ${calculateTotal().toFixed(2)}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearCart}
            disabled={loading}
          >
            Clear Cart
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Proceed to Checkout'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CartList; 