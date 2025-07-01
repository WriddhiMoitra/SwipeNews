import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FeedProvider } from './contexts/FeedContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { OfflineProvider } from './contexts/OfflineContext';
import HomeScreen from './app/(tabs)/index';
import SavedScreen from './app/(tabs)/saved';
import SourcesScreen from './app/(tabs)/sources';
import ProfileScreen from './app/(tabs)/profile';
import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { theme } = useTheme();
  const [preferencesSet, setPreferencesSet] = useState(false);
  const [checkingPreferences, setCheckingPreferences] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const checkPreferences = async () => {
      if (user && !user.isAnonymous) {
        try {
          const db = getFirestore();
          const userPrefDoc = await getDoc(doc(db, 'userPreferences', user.id));
          setPreferencesSet(userPrefDoc.exists());
        } catch (error) {
          console.error('Error checking preferences:', error);
          setPreferencesSet(false);
        }
      } else if (user && user.isAnonymous) {
        // For anonymous users, check local storage
        try {
          const localPrefs = await AsyncStorage.getItem('userPreferences');
          setPreferencesSet(!!localPrefs);
        } catch (error) {
          console.error('Error checking local preferences:', error);
          setPreferencesSet(false);
        }
      }
      setCheckingPreferences(false);
    };

    if (isAuthenticated && user) {
      checkPreferences();
    } else if (!isLoading) {
      setCheckingPreferences(false);
    }
  }, [isAuthenticated, user, isLoading]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (isLoading || checkingPreferences) {
    return <SplashScreen onFinish={() => {}} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  if (!preferencesSet) {
    return <PreferencesScreen onPreferencesSet={() => setPreferencesSet(true)} />;
  }

  return (
    <AnalyticsProvider>
      <OfflineProvider>
        <FeedProvider>
          <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = 'home';

              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Saved') {
                iconName = 'bookmark';
              } else if (route.name === 'Sources') {
                iconName = 'globe';
              } else if (route.name === 'Profile') {
                iconName = 'user';
              }

              return (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: focused ? theme.colors.primary + '20' : 'transparent',
                }}>
                  <Icon 
                    name={iconName} 
                    size={focused ? 24 : 22} 
                    color={focused ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                </View>
              );
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: theme.colors.card,
              borderTopWidth: 0,
              height: Platform.OS === 'ios' ? 85 : 70,
              paddingBottom: Platform.OS === 'ios' ? 25 : 10,
              paddingTop: 10,
              elevation: 20,
              shadowColor: theme.colors.shadow,
              shadowOffset: {
                width: 0,
                height: -4,
              },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              position: 'absolute',
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
      </OfflineProvider>
    </AnalyticsProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
