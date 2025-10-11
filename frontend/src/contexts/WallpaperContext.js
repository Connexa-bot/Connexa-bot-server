import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WallpaperContext = createContext();

const DEFAULT_WALLPAPERS = [
  { id: '1', name: 'Default Light', uri: null, color: '#ECE5DD' },
  { id: '2', name: 'Default Dark', uri: null, color: '#0B141A' },
  { id: '3', name: 'WhatsApp Green', uri: null, color: '#075E54' },
  { id: '4', name: 'Ocean Blue', uri: null, color: '#1A5F7A' },
  { id: '5', name: 'Sunset Orange', uri: null, color: '#FF6B35' },
  { id: '6', name: 'Forest Green', uri: null, color: '#2D4A2B' },
  { id: '7', name: 'Royal Purple', uri: null, color: '#4A148C' },
  { id: '8', name: 'Midnight Black', uri: null, color: '#000000' },
];

export const WallpaperProvider = ({ children }) => {
  const [wallpapers, setWallpapers] = useState(DEFAULT_WALLPAPERS);
  const [chatWallpapers, setChatWallpapers] = useState({});
  const [defaultWallpaper, setDefaultWallpaper] = useState(DEFAULT_WALLPAPERS[1]);

  useEffect(() => {
    loadWallpapers();
  }, []);

  const loadWallpapers = async () => {
    try {
      const savedChatWallpapers = await AsyncStorage.getItem('chatWallpapers');
      const savedDefaultWallpaper = await AsyncStorage.getItem('defaultWallpaper');
      
      if (savedChatWallpapers) {
        setChatWallpapers(JSON.parse(savedChatWallpapers));
      }
      
      if (savedDefaultWallpaper) {
        setDefaultWallpaper(JSON.parse(savedDefaultWallpaper));
      }
    } catch (error) {
      console.error('Error loading wallpapers:', error);
    }
  };

  const setChatWallpaper = async (chatId, wallpaper) => {
    try {
      const newChatWallpapers = { ...chatWallpapers, [chatId]: wallpaper };
      setChatWallpapers(newChatWallpapers);
      await AsyncStorage.setItem('chatWallpapers', JSON.stringify(newChatWallpapers));
    } catch (error) {
      console.error('Error saving chat wallpaper:', error);
    }
  };

  const setGlobalWallpaper = async (wallpaper) => {
    try {
      setDefaultWallpaper(wallpaper);
      await AsyncStorage.setItem('defaultWallpaper', JSON.stringify(wallpaper));
    } catch (error) {
      console.error('Error saving default wallpaper:', error);
    }
  };

  const getChatWallpaper = (chatId) => {
    return chatWallpapers[chatId] || defaultWallpaper;
  };

  const addCustomWallpaper = async (uri) => {
    const newWallpaper = {
      id: `custom-${Date.now()}`,
      name: 'Custom',
      uri,
      color: null,
    };
    setWallpapers([...wallpapers, newWallpaper]);
    return newWallpaper;
  };

  return (
    <WallpaperContext.Provider
      value={{
        wallpapers,
        defaultWallpaper,
        getChatWallpaper,
        setChatWallpaper,
        setGlobalWallpaper,
        addCustomWallpaper,
      }}
    >
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error('useWallpaper must be used within WallpaperProvider');
  }
  return context;
};
