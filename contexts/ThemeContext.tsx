import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext<{
  theme: {
    colors: {
      primary: string;
      text: string;
      textSecondary: string;
      background: string;
      card: string;
      border: string;
      shadow: string;
      surface: string;
      surfaceVariant: string;
      outline: string;
      success: string;
      error: string;
    };
  };
  toggleTheme: () => void;
}>({
  theme: {
    colors: {
      primary: '#E50914',
      text: '#1a1a1a',
      textSecondary: '#666666',
      background: '#ffffff',
      card: '#ffffff',
      border: '#e0e0e0',
      shadow: '#000000',
      surface: '#f5f5f5',
      surfaceVariant: '#f0f0f0',
      outline: '#cccccc',
      success: '#4CAF50',
      error: '#F44336',
    },
  },
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(isDarkMode);

  useEffect(() => {
    setIsDark(isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const theme = {
    colors: {
      primary: '#E50914',
      text: isDark ? '#ffffff' : '#1a1a1a',
      textSecondary: isDark ? '#b0b0b0' : '#666666',
      background: isDark ? '#121212' : '#ffffff',
      card: isDark ? '#1e1e1e' : '#ffffff',
      border: isDark ? '#333333' : '#e0e0e0',
      shadow: isDark ? '#000000' : '#000000',
      surface: isDark ? '#242424' : '#f5f5f5',
      surfaceVariant: isDark ? '#2c2c2c' : '#f0f0f0',
      outline: isDark ? '#404040' : '#cccccc',
      success: '#4CAF50',
      error: '#F44336',
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
