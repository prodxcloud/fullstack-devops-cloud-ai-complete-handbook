import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';

interface CheckoutStatusProps {
  status: 'success' | 'cancelled' | 'error';
  orderId?: string;
  message?: string;
}

const CheckoutStatus: React.FC<CheckoutStatusProps> = ({ status, orderId, message }) => {
  const statusConfig = {
    success: {
      icon: <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />,
      title: 'Payment Successful',
      color: 'success.main',
    },
    cancelled: {
      icon: <CancelIcon sx={{ fontSize: 20, color: 'warning.main' }} />,
      title: 'Payment Cancelled',
      color: 'warning.main',
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: 20, color: 'error.main' }} />,
      title: 'Payment Failed',
      color: 'error.main',
    },
  };

  const config = statusConfig[status];

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '50vh' 
    }}>
      <Paper 
        elevation={1}
        sx={{ 
          p: 3, 
          maxWidth: 320,
          textAlign: 'center',
          backgroundColor: status === 'success' ? 'success.lighter' : 
                         status === 'cancelled' ? 'warning.lighter' : 
                         'error.lighter'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          {config.icon}
          
          <Typography variant="h6" color={config.color} sx={{ fontWeight: 500 }}>
            {config.title}
          </Typography>
          
          {orderId && (
            <Typography variant="caption" color="text.secondary">
              Order ID: <Box component="span" sx={{ fontWeight: 500 }}>{orderId}</Box>
            </Typography>
          )}
          
          {message && (
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250 }}>
              {message}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              href="/orders"
              sx={{ textTransform: 'none' }}
            >
              View Orders
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              href="/"
              sx={{ textTransform: 'none' }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CheckoutStatus; 