'use client';

import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#232F3E',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              About Us
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              About ProdxCloud
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Careers
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Press Releases
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Customer Service
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Contact Us
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Returns
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Shipping Info
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Privacy & Terms
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Privacy Notice
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Terms of Use
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Cookie Policy
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Connect With Us
            </Typography>
            <Box>
              <IconButton color="inherit">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />

        <Box textAlign="center">
          <Typography variant="body2" color="inherit">
            © {new Date().getFullYear()} ProdxCloud. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 