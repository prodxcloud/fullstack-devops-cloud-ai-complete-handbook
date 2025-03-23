'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/authStore';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';

export default function ProfilePage() {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8585/api/v1/auth/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserDetails(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching user details:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/auth/login');
        } else {
          setError('Failed to load profile data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [router]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>{error}</Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/auth/login')}
            sx={{ mt: 2 }}
          >
            Return to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!userDetails) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">Failed to load user profile</Typography>
      </Container>
    );
  }

  // Format dates properly
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12} display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {userDetails.first_name?.[0]?.toUpperCase() || userDetails.email?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                {userDetails.first_name} {userDetails.last_name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Member since {formatDate(userDetails.date_joined)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* User Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <List>
              {userDetails.username && (
                <ListItem>
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText
                    primary="Username"
                    secondary={userDetails.username}
                  />
                </ListItem>
              )}
              <ListItem>
                <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary="Email"
                  secondary={userDetails.email}
                />
              </ListItem>
              {userDetails.phone && (
                <ListItem>
                  <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText
                    primary="Phone"
                    secondary={userDetails.phone}
                  />
                </ListItem>
              )}
              <ListItem>
                <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary="Account Created"
                  secondary={formatDate(userDetails.date_joined)}
                />
              </ListItem>
              <ListItem>
                <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary="Last Login"
                  secondary={formatDate(userDetails.last_login)}
                />
              </ListItem>
            </List>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="contained"
                onClick={() => router.push('/orders')}
              >
                View Orders
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/cart')}
              >
                View Cart
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 