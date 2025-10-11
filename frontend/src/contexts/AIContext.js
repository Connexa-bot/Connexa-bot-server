import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AIContext = createContext();

const DEFAULT_SETTINGS = {
  autoReplyEnabled: false,
  smartRepliesEnabled: true,
  imageAnalysisEnabled: true,
  voiceTranscriptionEnabled: true,
  personality: 'friendly and helpful',
  language: 'auto-detect',
  contextWindow: 10,
};

export const AIProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [chatSettings, setChatSettings] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('aiSettings');
      const savedChatSettings = await AsyncStorage.getItem('aiChatSettings');
      
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
      
      if (savedChatSettings) {
        setChatSettings(JSON.parse(savedChatSettings));
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem('aiSettings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving AI settings:', error);
    }
  };

  const updateChatSettings = async (chatId, newSettings) => {
    try {
      const updated = { ...chatSettings, [chatId]: newSettings };
      setChatSettings(updated);
      await AsyncStorage.setItem('aiChatSettings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving chat AI settings:', error);
    }
  };

  const getChatSettings = (chatId) => {
    return chatSettings[chatId] || settings;
  };

  const toggleAutoReply = async (chatId = null) => {
    if (chatId) {
      const current = getChatSettings(chatId);
      await updateChatSettings(chatId, {
        ...current,
        autoReplyEnabled: !current.autoReplyEnabled,
      });
    } else {
      await updateSettings({ autoReplyEnabled: !settings.autoReplyEnabled });
    }
  };

  return (
    <AIContext.Provider
      value={{
        settings,
        chatSettings,
        updateSettings,
        updateChatSettings,
        getChatSettings,
        toggleAutoReply,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};
