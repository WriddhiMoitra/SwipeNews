import React from 'react';
import { Slot } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FeedProvider } from '../contexts/FeedContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import { PersonalizationProvider } from '../contexts/PersonalizationContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnalyticsProvider>
          <PersonalizationProvider>
            <FeedProvider>
              <Slot />
            </FeedProvider>
          </PersonalizationProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
