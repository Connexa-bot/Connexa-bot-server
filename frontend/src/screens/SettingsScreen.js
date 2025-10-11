import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';
import { useWallpaper } from '../contexts/WallpaperContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings, updateSettings } = useAI();
  const { wallpapers, defaultWallpaper, setGlobalWallpaper, addCustomWallpaper } = useWallpaper();
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleWallpaperSelect = async (wallpaper) => {
    await setGlobalWallpaper(wallpaper);
    setShowWallpaperPicker(false);
    Alert.alert('Success', 'Wallpaper updated successfully');
  };

  const handleCustomWallpaper = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const newWallpaper = await addCustomWallpaper(result.assets[0].uri);
        await setGlobalWallpaper(newWallpaper);
        setShowWallpaperPicker(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set custom wallpaper');
    }
  };

  const personalities = [
    { value: 'friendly and helpful', label: 'Friendly & Helpful' },
    { value: 'professional and courteous', label: 'Professional' },
    { value: 'casual and fun', label: 'Casual & Fun' },
    { value: 'empathetic and understanding', label: 'Empathetic' },
  ];

  const handlePersonalityChange = () => {
    Alert.alert(
      'AI Personality',
      'Choose how the AI should respond',
      personalities.map(p => ({
        text: p.label,
        onPress: () => updateSettings({ personality: p.value }),
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={24} color={colors.icon} style={styles.settingIcon} />
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      )}
    </TouchableOpacity>
  );

  const renderWallpaperItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.wallpaperItem,
        { 
          backgroundColor: item.color || '#ccc',
          borderColor: item.id === defaultWallpaper.id ? colors.primary : 'transparent',
        }
      ]}
      onPress={() => handleWallpaperSelect(item)}
    >
      {item.id === defaultWallpaper.id && (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </View>
      )}
      <Text style={styles.wallpaperName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1}}>
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.profileSection, { borderBottomColor: colors.border }]}>
        <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.profileAvatarText}>
            {user?.phone?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {user?.phone || 'User'}
          </Text>
          <Text style={[styles.profileStatus, { color: colors.secondaryText }]}>
            Hey there! I am using WhatsApp
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>Appearance</Text>
        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          subtitle={isDark ? 'On' : 'Off'}
          onPress={toggleTheme}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          }
        />
        <SettingItem
          icon="image-outline"
          title="Chat Wallpaper"
          subtitle={defaultWallpaper.name}
          onPress={() => setShowWallpaperPicker(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>AI Automation</Text>
        <SettingItem
          icon="flash-outline"
          title="Auto-Reply"
          subtitle={settings.autoReplyEnabled ? "Enabled" : "Disabled"}
          onPress={() => updateSettings({ autoReplyEnabled: !settings.autoReplyEnabled })}
          rightElement={
            <Switch
              value={settings.autoReplyEnabled}
              onValueChange={(val) => updateSettings({ autoReplyEnabled: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          }
        />
        <SettingItem
          icon="chatbubbles-outline"
          title="Smart Replies"
          subtitle={settings.smartRepliesEnabled ? "Enabled" : "Disabled"}
          onPress={() => updateSettings({ smartRepliesEnabled: !settings.smartRepliesEnabled })}
          rightElement={
            <Switch
              value={settings.smartRepliesEnabled}
              onValueChange={(val) => updateSettings({ smartRepliesEnabled: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          }
        />
        <SettingItem
          icon="image-outline"
          title="Image Analysis"
          subtitle={settings.imageAnalysisEnabled ? "Enabled" : "Disabled"}
          onPress={() => updateSettings({ imageAnalysisEnabled: !settings.imageAnalysisEnabled })}
          rightElement={
            <Switch
              value={settings.imageAnalysisEnabled}
              onValueChange={(val) => updateSettings({ imageAnalysisEnabled: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          }
        />
        <SettingItem
          icon="mic-outline"
          title="Voice Transcription"
          subtitle={settings.voiceTranscriptionEnabled ? "Enabled" : "Disabled"}
          onPress={() => updateSettings({ voiceTranscriptionEnabled: !settings.voiceTranscriptionEnabled })}
          rightElement={
            <Switch
              value={settings.voiceTranscriptionEnabled}
              onValueChange={(val) => updateSettings({ voiceTranscriptionEnabled: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          }
        />
        <SettingItem
          icon="person-circle-outline"
          title="AI Personality"
          subtitle={personalities.find(p => p.value === settings.personality)?.label || 'Friendly'}
          onPress={handlePersonalityChange}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: '#F44336' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.secondaryText }]}>
          ConnexaBot v1.0.0
        </Text>
      </View>
    </ScrollView>

    <Modal
      visible={showWallpaperPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowWallpaperPicker(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose Wallpaper
            </Text>
            <TouchableOpacity onPress={() => setShowWallpaperPicker(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={wallpapers}
            renderItem={renderWallpaperItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.wallpaperList}
          />

          <TouchableOpacity
            style={[styles.customWallpaperButton, { backgroundColor: colors.primary }]}
            onPress={handleCustomWallpaper}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.customWallpaperText}>Add Custom</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  wallpaperList: {
    padding: 16,
  },
  wallpaperItem: {
    flex: 1,
    height: 120,
    margin: 8,
    borderRadius: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 12,
    borderWidth: 3,
  },
  wallpaperName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
  },
  customWallpaperButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  customWallpaperText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
