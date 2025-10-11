import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

export default function ChatHeader({ chat, onVideoCall, onVoiceCall, onMore }) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.header || '#202C33' }]}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.chatInfo}
        onPress={onMore}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          {chat.profilePic ? (
            <Image source={{ uri: chat.profilePic }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {chat.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>
            {chat.name || chat.id}
          </Text>
          <Text style={styles.status} numberOfLines={1}>
            {chat.isOnline ? 'online' : chat.lastSeen || 'offline'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onVideoCall}
        >
          <Ionicons name="videocam" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onVoiceCall}
        >
          <Ionicons name="call" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onMore}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    height: 64,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  chatInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  details: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  status: {
    color: '#8696A0',
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});
