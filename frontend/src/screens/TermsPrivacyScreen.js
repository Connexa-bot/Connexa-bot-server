import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function TermsPrivacyScreen({ onContinue }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Ionicons 
          name="logo-whatsapp" 
          size={80} 
          color="#25D366" 
          style={styles.logo}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          Welcome to WhatsApp
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.description, { color: colors.secondaryText }]}>
          Read our Privacy Policy. Tap "Agree and continue" to accept the Terms of Service.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Privacy & Security
          </Text>
          <Text style={[styles.sectionText, { color: colors.secondaryText }]}>
            • Your messages are encrypted end-to-end{'\n'}
            • We don't store your personal conversations{'\n'}
            • AI features process data securely{'\n'}
            • You control your data and privacy settings
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Terms of Service
          </Text>
          <Text style={[styles.sectionText, { color: colors.secondaryText }]}>
            • Use ConnexaBot responsibly and legally{'\n'}
            • Respect other users and their privacy{'\n'}
            • AI features are provided as-is{'\n'}
            • We may update terms periodically
          </Text>
        </View>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={[styles.linkText, { color: colors.primary }]}>
            Read Full Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={[styles.linkText, { color: colors.primary }]}>
            Read Full Terms of Service
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onContinue}
        >
          <Text style={styles.buttonText}>Agree and continue</Text>
        </TouchableOpacity>
        
        <Text style={[styles.footerNote, { color: colors.secondaryText }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
