import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';
import { getAuth, signOut } from 'firebase/auth';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [userName, setUserName] = useState('User Name');
  const [userEmail, setUserEmail] = useState('user@example.com');

  useEffect(() => {
    if (user) {
      setUserName(user.name || 'User Name');
      setUserEmail(user.email || 'user@example.com');
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
      console.error('Logout error:', error);
    }
  };

  const handleEditProfile = () => {
    // Placeholder for edit profile functionality
    Alert.alert('Edit Profile', 'This feature is under development.');
  };

  const handleSettings = () => {
    // Placeholder for settings functionality
    Alert.alert('Settings', 'This feature is under development.');
  };

  const handleNotifications = () => {
    // Placeholder for notifications functionality
    Alert.alert('Notifications', 'This feature is under development.');
  };

  const handleHelpSupport = () => {
    // Placeholder for help & support functionality
    Alert.alert('Help & Support', 'This feature is under development.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
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
          <Icon name="user" size={24} color="#1a1a1a" />
          <Text style={styles.optionText}>Edit Profile</Text>
          <Icon name="chevron-right" size={24} color="#a0a0a0" style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={handleSettings}>
          <Icon name="settings" size={24} color="#1a1a1a" />
          <Text style={styles.optionText}>Settings</Text>
          <Icon name="chevron-right" size={24} color="#a0a0a0" style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={handleNotifications}>
          <Icon name="bell" size={24} color="#1a1a1a" />
          <Text style={styles.optionText}>Notifications</Text>
          <Icon name="chevron-right" size={24} color="#a0a0a0" style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={handleHelpSupport}>
          <Icon name="help-circle" size={24} color="#1a1a1a" />
          <Text style={styles.optionText}>Help & Support</Text>
          <Icon name="chevron-right" size={24} color="#a0a0a0" style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
          <Icon name="log-out" size={24} color="#E50914" />
          <Text style={[styles.optionText, { color: '#E50914' }]}>Logout</Text>
          <Icon name="chevron-right" size={24} color="#E50914" style={styles.optionIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  profileContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#E50914',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  statText: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 18,
    color: '#1a1a1a',
  },
  optionIcon: {
    marginLeft: 10,
  },
});
