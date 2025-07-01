import React from 'react';
import { Slot } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FeedProvider } from '../contexts/FeedContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FeedProvider>
          <Slot />
        </FeedProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
