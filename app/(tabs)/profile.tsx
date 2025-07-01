import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SettingsScreen from '../../screens/SettingsScreen';
import SearchScreen from '../../screens/SearchScreen';
import AnalyticsScreen from '../../screens/AnalyticsScreen';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [userName, setUserName] = useState('User Name');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.name || 'User Name');
      setUserEmail(user.email || 'user@example.com');
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Logged Out', 'You have been successfully logged out.');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // Placeholder for edit profile functionality
    Alert.alert('Edit Profile', 'This feature is under development.');
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleSearch = () => {
    setShowSearch(true);
  };

  const handleAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleNotifications = () => {
    // Placeholder for notifications functionality
    Alert.alert('Notifications', 'This feature is under development.');
  };

  const handleHelpSupport = () => {
    // Placeholder for help & support functionality
    Alert.alert('Help & Support', 'This feature is under development.');
  };

  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }

  if (showSearch) {
    return <SearchScreen onBack={() => setShowSearch(false)} />;
  }

  if (showAnalytics) {
    return <AnalyticsScreen onBack={() => setShowAnalytics(false)} />;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
    },
    profileContainer: {
      alignItems: 'center',
      padding: 30,
      backgroundColor: theme.colors.card,
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    profileImageContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: 'hidden',
      marginBottom: 15,
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    profileImagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userName: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 5,
    },
    userEmail: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 20,
      backgroundColor: theme.colors.card,
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    statBox: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 5,
    },
    statText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    optionsContainer: {
      backgroundColor: theme.colors.card,
      flex: 1,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    optionText: {
      flex: 1,
      marginLeft: 15,
      fontSize: 18,
      color: theme.colors.text,
    },
    optionIcon: {
      marginLeft: 10,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Icon name="user" size={40} color="#E50914" />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>25</Text>
          <Text style={styles.statText}>Read</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>10</Text>
          <Text style={styles.statText}>Saved</Text>
        </View>
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionItem} onPress={handleEditProfile}>
          <Icon name="user" size={24} color={theme.colors.text} />
          <Text style={styles.optionText}>Edit Profile</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={handleSearch}>
          <Icon name="search" size={24} color={theme.colors.text} />
          <Text style={styles.optionText}>Search Articles</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={handleAnalytics}>
          <Icon name="bar-chart-2" size={24} color={theme.colors.text} />
          <Text style={styles.optionText}>Reading Analytics</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={handleSettings}>
          <Icon name="settings" size={24} color={theme.colors.text} />
          <Text style={styles.optionText}>Settings</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={handleNotifications}>
          <Icon name="bell" size={24} color={theme.colors.text} />
          <Text style={styles.optionText}>Notifications</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={handleHelpSupport}>
          <Icon name="help-circle" size={24} color={theme.colors.text} />
          <Text style={styles.optionText}>Help & Support</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
          <Icon name="log-out" size={24} color={theme.colors.error} />
          <Text style={[styles.optionText, { color: theme.colors.error }]}>Logout</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.error} style={styles.optionIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
