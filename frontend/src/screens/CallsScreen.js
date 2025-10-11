import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getCalls } from '../services/api';

export default function CallsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      if (user?.phone) {
        const response = await getCalls(user.phone);
        setCalls(response.data.calls || []);
      }
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCalls();
  };

  const renderCall = ({ item }) => (
    <TouchableOpacity
      style={[styles.callItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      
      <View style={styles.callContent}>
        <Text style={[styles.callName, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.callInfo}>
          <Ionicons
            name={item.type === 'incoming' ? 'arrow-down' : 'arrow-up'}
            size={16}
            color={item.missed ? '#F44336' : colors.secondaryText}
          />
          <Text style={[styles.callTime, { color: colors.secondaryText }]}>
            {item.time}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.callButton}>
        <Ionicons
          name={item.video ? 'videocam' : 'call'}
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {calls.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="call-outline" size={64} color={colors.secondaryText} />
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No calls yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
            Call history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={calls}
          renderItem={renderCall}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  callItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  callContent: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTime: {
    fontSize: 14,
    marginLeft: 8,
  },
  callButton: {
    padding: 8,
  },
});
