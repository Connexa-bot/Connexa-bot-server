import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getCommunities } from '../services/api';

export default function CommunitiesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      if (user?.phone) {
        const response = await getCommunities(user.phone);
        setCommunities(response.data.communities || []);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCommunities();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/whatsapp-logo.svg')}
          style={styles.logo}
        />
      </View>

      {communities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color={colors.secondaryText} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Stay connected with a community
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
            Communities bring members together in topic-based groups and make it easy to get admin announcements
          </Text>
          <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.startButtonText}>Start your community</Text>
          </TouchableOpacity>
        </View>
      ) : (
        communities.map((community) => (
          <TouchableOpacity
            key={community.id}
            style={[styles.communityItem, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.communityAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{community.name.charAt(0)}</Text>
            </View>
            <View style={styles.communityContent}>
              <Text style={[styles.communityName, { color: colors.text }]}>
                {community.name}
              </Text>
              <Text style={[styles.communityMembers, { color: colors.secondaryText }]}>
                {community.memberCount} members
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 24,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  communityItem: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  communityAvatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  communityContent: {
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  communityMembers: {
    fontSize: 14,
  },
});
