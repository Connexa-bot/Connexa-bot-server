import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  getStatusUpdates, 
  postTextStatus, 
  postImageStatus, 
  postVideoStatus, 
  postAudioStatus 
} from '../services/api';

export default function UpdatesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      if (user?.phone) {
        const response = await getStatusUpdates(user.phone);
        setStatuses(response.data?.statuses || []);
      }
    } catch (error) {
      console.error('Error loading statuses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStatuses();
  };

  const handlePostTextStatus = async () => {
    if (!statusText.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    setPosting(true);
    try {
      await postTextStatus(user.phone, statusText);
      setStatusText('');
      setShowPostModal(false);
      Alert.alert('Success', 'Status posted successfully');
      loadStatuses();
    } catch (error) {
      Alert.alert('Error', 'Failed to post status');
    } finally {
      setPosting(false);
    }
  };

  const handlePostImageStatus = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setPosting(true);
        await postImageStatus(user.phone, result.assets[0].uri);
        Alert.alert('Success', 'Image status posted successfully');
        loadStatuses();
        setPosting(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post image status');
      setPosting(false);
    }
  };

  const handlePostVideoStatus = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
      });

      if (!result.canceled) {
        setPosting(true);
        await postVideoStatus(user.phone, result.assets[0].uri);
        Alert.alert('Success', 'Video status posted successfully');
        loadStatuses();
        setPosting(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post video status');
      setPosting(false);
    }
  };

  const showStatusOptions = () => {
    Alert.alert(
      'Post Status',
      'Choose status type',
      [
        { text: 'Text', onPress: () => setShowPostModal(true) },
        { text: 'Image', onPress: handlePostImageStatus },
        { text: 'Video', onPress: handlePostVideoStatus },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
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
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Status</Text>
        
        <TouchableOpacity
          style={[styles.myStatus, { borderBottomColor: colors.border }]}
          onPress={showStatusOptions}
        >
          <View style={[styles.statusAvatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
          <View style={styles.statusContent}>
            <Text style={[styles.statusName, { color: colors.text }]}>My status</Text>
            <Text style={[styles.statusText, { color: colors.secondaryText }]}>
              Tap to add status update
            </Text>
          </View>
        </TouchableOpacity>

        {statuses.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No recent updates
            </Text>
          </View>
        ) : (
          statuses.map((status) => (
            <TouchableOpacity
              key={status.id}
              style={[styles.statusItem, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.statusAvatar, { borderColor: colors.primary, borderWidth: 2 }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>
                  {status.name?.charAt(0) || '?'}
                </Text>
              </View>
              <View style={styles.statusContent}>
                <Text style={[styles.statusName, { color: colors.text }]}>{status.name}</Text>
                <Text style={[styles.statusTime, { color: colors.secondaryText }]}>
                  {status.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={[styles.section, { marginTop: 20 }]}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Channels</Text>
        <View style={styles.emptySection}>
          <Ionicons name="megaphone-outline" size={48} color={colors.secondaryText} />
          <Text style={[styles.emptyText, { color: colors.secondaryText, marginTop: 12 }]}>
            Stay updated on topics that matter to you
          </Text>
          <TouchableOpacity style={[styles.findButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.findButtonText}>Find channels to follow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

    <Modal
      visible={showPostModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPostModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Post Text Status</Text>
            <TouchableOpacity onPress={() => setShowPostModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.textInput, { backgroundColor: colors.secondaryBackground, color: colors.text }]}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.secondaryText}
            value={statusText}
            onChangeText={setStatusText}
            multiline
            maxLength={700}
          />

          <TouchableOpacity
            style={[styles.postButton, { backgroundColor: colors.primary }]}
            onPress={handlePostTextStatus}
            disabled={posting}
          >
            {posting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>Post Status</Text>
            )}
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
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  myStatus: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  statusItem: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  statusAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  statusContent: {
    flex: 1,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
  },
  statusTime: {
    fontSize: 14,
  },
  emptySection: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  findButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  postButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
