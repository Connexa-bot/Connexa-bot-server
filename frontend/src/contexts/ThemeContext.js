import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(systemColorScheme || 'light');

  const colors = {
    light: {
      primary: '#25D366',
      background: '#FFFFFF',
      secondaryBackground: '#F0F2F5',
      chatBackground: '#EFEAE2',
      text: '#000000',
      secondaryText: '#667781',
      border: '#E9EDEF',
      messageSent: '#D9FDD3',
      messageReceived: '#FFFFFF',
      icon: '#54656F',
      tabBar: '#F0F2F5',
      header: '#008069',
    },
    dark: {
      primary: '#25D366',
      background: '#0B141A',
      secondaryBackground: '#202C33',
      chatBackground: '#0B141A',
      text: '#E9EDEF',
      secondaryText: '#8696A0',
      border: '#2A3942',
      messageSent: '#005C4B',
      messageReceived: '#202C33',
      icon: '#8696A0',
      tabBar: '#1F2C34',
      header: '#202C33',
    },
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: colors[theme],
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
