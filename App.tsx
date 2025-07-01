import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { AuthProvider } from './contexts/AuthContext';
import { FeedProvider } from './contexts/FeedContext';
import HomeScreen from './app/(tabs)/index';
import SavedScreen from './app/(tabs)/saved';
import SourcesScreen from './app/(tabs)/sources';
import ProfileScreen from './app/(tabs)/profile';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AuthProvider>
      <FeedProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#000000" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: string;

                if (route.name === 'Home') {
                  iconName = focused ? 'home' : 'home';
                } else if (route.name === 'Saved') {
                  iconName = focused ? 'bookmark' : 'bookmark';
                } else if (route.name === 'Sources') {
                  iconName = focused ? 'rss' : 'rss';
                } else {
                  iconName = focused ? 'user' : 'user';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#FF5722',
              tabBarInactiveTintColor: '#888888',
              tabBarStyle: {
                backgroundColor: '#1a1a1a',
                borderTopColor: '#333333',
                borderTopWidth: 1,
                paddingBottom: 8,
                paddingTop: 8,
                height: 60,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4,
              },
              headerShown: false,
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Saved" component={SavedScreen} />
            <Tab.Screen name="Sources" component={SourcesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </FeedProvider>
    </AuthProvider>
  );
}
