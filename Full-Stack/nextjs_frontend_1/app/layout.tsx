'use client';

import React, { useEffect } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Box } from '@mui/material';
import ChatSupport from './components/ChatSupport';
import { Providers } from './providers';
import { AuthProvider } from './contexts/AuthContext';
import GoogleAuthProvider from './providers/GoogleOAuthProvider';

const inter = Inter({ subsets: ["latin"] });

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <Providers>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  minHeight: '100vh',
                }}>
                  <Navbar />
                  <Box 
                    component="main" 
                    sx={{ 
                      flexGrow: 1,
                      pt: { xs: 8, sm: 9, md: 10 }, // Increased top padding
                      pb: { xs: 8, sm: 10, md: 12 }, // Added bottom padding
                      display: 'flex',
                      flexDirection: 'column',
                      gap: { xs: 4, sm: 6, md: 8 }, // Added gap between sections
                    }}
                  >
                    {children}
                  </Box>
                  <Footer />
                  <ChatSupport />
                </Box>
              </Providers>
            </AuthProvider>
          </ThemeProvider>
        </GoogleAuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
        />
      </body>
    </html>
  );
}
