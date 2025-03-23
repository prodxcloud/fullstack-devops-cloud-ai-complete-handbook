'use client';

import { Box, CircularProgress, LinearProgress } from '@mui/material';

interface LoadingOverlayProps {
  fullscreen?: boolean;
  message?: string;
}

export default function LoadingOverlay({ fullscreen = false, message }: LoadingOverlayProps) {
  const content = (
    <>
      <LinearProgress sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          height: fullscreen ? '100vh' : '100%',
          width: '100%',
          position: fullscreen ? 'fixed' : 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9998,
        }}
      >
        <CircularProgress size={40} />
        {message && (
          <Box
            sx={{
              color: 'text.primary',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            {message}
          </Box>
        )}
      </Box>
    </>
  );

  return content;
} 