import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function SmartReplyBar({ suggestions, onSelectSuggestion, onDismiss }) {
  const { colors } = useTheme();

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground || '#1F2C34' }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="sparkles" size={16} color="#FFD700" />
          <Text style={styles.title}>AI Suggestions</Text>
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <Ionicons name="close" size={20} color="#8696A0" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestions}
      >
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.suggestionButton, { backgroundColor: '#2A3942' }]}
            onPress={() => onSelectSuggestion(suggestion)}
          >
            <Text style={styles.suggestionText} numberOfLines={2}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  suggestions: {
    paddingVertical: 4,
  },
  suggestionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: 200,
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
