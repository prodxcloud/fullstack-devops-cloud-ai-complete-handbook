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
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import { Google as GoogleIcon, Microsoft as MicrosoftIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/products');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      await login(email, password);
      
      toast.success('Login successful');
      router.push('/products');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Initiating Google login...');
      await googleLogin();
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Failed to login with Google. Please try again.');
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = () => {
    // Implement Microsoft OAuth login
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
            Welcome Back
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            align="center" 
            sx={{ mb: 4 }}
          >
            Sign in to continue to ProdxCloud
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{ 
                py: 1.5,
                borderColor: '#4285f4',
                color: '#4285f4',
                '&:hover': {
                  borderColor: '#357abd',
                  backgroundColor: 'rgba(66, 133, 244, 0.04)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Continue with Google'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MicrosoftIcon />}
              onClick={handleMicrosoftLogin}
              disabled={loading}
              sx={{ 
                py: 1.5,
                borderColor: '#ddd',
                '&:hover': {
                  borderColor: '#bbb',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              Continue with Microsoft
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              sx={{ mb: 2 }}
            />

            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <Link href="/auth/forgot-password" passHref>
                <MuiLink variant="body2" sx={{ color: 'primary.main' }}>
                  Forgot password?
                </MuiLink>
              </Link>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  color="primary"
                  required
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
              size="large"
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
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link href="/auth/register" passHref>
                <MuiLink sx={{ color: 'primary.main', fontWeight: 500 }}>
                  Sign up
                </MuiLink>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 