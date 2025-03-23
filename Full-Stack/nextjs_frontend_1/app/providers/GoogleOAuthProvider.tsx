'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CONFIG = {
  client_id: "954859384090-rj998egtjk1i5ck48dupgj534fbk7ks5.apps.googleusercontent.com",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  redirect_uri: "http://localhost:3000/auth/google/callback"
};

export default function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider 
      clientId={GOOGLE_CONFIG.client_id}
      onScriptLoadError={() => {
        console.error('Google OAuth script failed to load');
      }}
      onScriptLoadSuccess={() => {
        console.log('Google OAuth script loaded successfully');
      }}
    >
      {children}
    </GoogleOAuthProvider>
  );
} 