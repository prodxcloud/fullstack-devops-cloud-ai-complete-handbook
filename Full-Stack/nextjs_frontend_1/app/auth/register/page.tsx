'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  Alert,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Microsoft as MicrosoftIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    phone: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/products');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      toast.error('Please accept the terms and conditions');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.username,
        formData.phone
      );
      toast.success('Registration successful!');
      router.push('/products');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = process.env.NEXT_PUBLIC_API_URL + '/auth/google';
  };

  const handleMicrosoftSignup = () => {
    window.location.href = process.env.NEXT_PUBLIC_API_URL + '/auth/microsoft';
  };

  if (authLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ 
          background: 'linear-gradient(to bottom, #f5f5f5, #e0e0e0)',
          pt: -8 // Offset for the navbar
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #f5f5f5, #e0e0e0)',
        pt: -8, // Offset for the navbar
      }}
    >
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: '#ffffff',
            backdropFilter: 'blur(10px)',
            transform: 'translateY(-10%)', // Move up slightly
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: '#1a1a1a',
              mb: 2
            }}
          >
            Create an Account
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            align="center" 
            sx={{ mb: 4 }}
          >
            Join ProdxCloud to start shopping
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleRegister} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  sx={{ mb: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  sx={{ mb: 1 }}
                />
              </Grid>
            </Grid>
            
            <TextField
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mt: 2, mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Username (Optional)"
              name="username"
              value={formData.username}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Phone Number (Optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              required
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I accept the{' '}
                  <Link href="/terms" passHref>
                    <MuiLink sx={{ color: 'primary.main' }}>Terms and Conditions</MuiLink>
                  </Link>
                </Typography>
              }
              sx={{ mt: 1, mb: 2 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 2,
                mb: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignup}
              sx={{ 
                py: 1.5,
                borderColor: '#ddd',
                '&:hover': {
                  borderColor: '#bbb',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              Sign up with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MicrosoftIcon />}
              onClick={handleMicrosoftSignup}
              sx={{ 
                py: 1.5,
                borderColor: '#ddd',
                '&:hover': {
                  borderColor: '#bbb',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              Sign up with Microsoft
            </Button>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link href="/auth/login" passHref>
                <MuiLink sx={{ color: 'primary.main', fontWeight: 500 }}>
                  Sign in
                </MuiLink>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 