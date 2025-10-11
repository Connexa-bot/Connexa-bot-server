import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import ChatsScreen from '../screens/ChatsScreen';
import UpdatesScreen from '../screens/UpdatesScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import CallsScreen from '../screens/CallsScreen';

const Tab = createMaterialTopTabNavigator();

export default function MainTabNavigator() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.secondaryText,
          tabBarIndicatorStyle: {
            backgroundColor: colors.text,
            height: 3,
          },
          tabBarStyle: {
            backgroundColor: colors.header,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
          },
        }}
      >
        <Tab.Screen 
          name="Chats" 
          component={ChatsScreen}
        />
        <Tab.Screen 
          name="Updates" 
          component={UpdatesScreen}
        />
        <Tab.Screen 
          name="Communities" 
          component={CommunitiesScreen}
        />
        <Tab.Screen 
          name="Calls" 
          component={CallsScreen}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    marginRight: 12,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
});
