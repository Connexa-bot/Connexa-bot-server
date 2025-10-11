import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import MainTabNavigator from './MainTabNavigator';
import ChatViewScreen from '../screens/ChatViewScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.header,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={({ navigation }) => ({
          title: 'WhatsApp',
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: '#FFFFFF',
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 8 }}>
              <TouchableOpacity
                style={{ padding: 8 }}
                onPress={() => {}}
              >
                <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 8, marginLeft: 8 }}
                onPress={() => {}}
              >
                <Ionicons name="search-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 8, marginLeft: 8 }}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="ChatView"
        component={ChatViewScreen}
        options={{
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack.Navigator>
  );
}
