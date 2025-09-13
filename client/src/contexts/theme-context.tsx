/**
 * Theme Management Context
 * 
 * Provides theme switching functionality and state management for:
 * - Dark/light mode toggling
 * - Theme persistence in localStorage
 * - System preference detection
 * - Loading states during theme initialization
 * 
 * Features:
 * - Automatic theme detection from system preferences
 * - Persistent theme storage across browser sessions
 * - Smooth theme transitions
 * - Loading states to prevent flash of wrong theme
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get saved theme from localStorage or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
    setIsLoading(false);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newDarkMode = e.matches;
        setIsDarkMode(newDarkMode);
        document.documentElement.classList.toggle('dark', newDarkMode);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
