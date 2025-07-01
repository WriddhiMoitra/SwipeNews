import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './contexts/AuthContext';
import { FeedProvider } from './contexts/FeedContext';
import HomeScreen from './app/(tabs)/index';
import SavedScreen from './app/(tabs)/saved';
import SourcesScreen from './app/(tabs)/sources';
import ProfileScreen from './app/(tabs)/profile';
import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [preferencesSet, setPreferencesSet] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        const userPrefDoc = await getDoc(doc(db, 'userPreferences', user.uid));
        setPreferencesSet(userPrefDoc.exists());
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  if (!preferencesSet) {
    return <PreferencesScreen onPreferencesSet={() => setPreferencesSet(true)} />;
  }

  return (
    <AuthProvider>
      <FeedProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName = 'home';

                if (route.name === 'Home') {
                  iconName = focused ? 'home' : 'home';
                } else if (route.name === 'Saved') {
                  iconName = focused ? 'bookmark' : 'bookmark';
                } else if (route.name === 'Sources') {
                  iconName = focused ? 'globe' : 'globe';
                } else if (route.name === 'Profile') {
                  iconName = focused ? 'user' : 'user';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#E50914',
              tabBarInactiveTintColor: 'gray',
              tabBarStyle: {
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: '#f0f0f0',
                height: 60,
                paddingBottom: 10,
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
