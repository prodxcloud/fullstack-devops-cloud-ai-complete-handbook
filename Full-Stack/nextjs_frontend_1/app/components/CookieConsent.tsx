'use client';

import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Button,
  Box,
  Typography,
  Link,
} from '@mui/material';
import CookieIcon from '@mui/icons-material/Cookie';

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        '& .MuiPaper-root': {
          maxWidth: 600,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CookieIcon color="primary" sx={{ fontSize: 40 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" gutterBottom>
            We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          </Typography>
          <Link href="/privacy-policy" color="primary" sx={{ mr: 2 }}>
            Learn more
          </Link>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAccept}
            sx={{ mt: { xs: 1, sm: 0 } }}
          >
            Accept
          </Button>
        </Box>
      </Box>
    </Snackbar>
  );
} 