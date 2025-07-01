import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export default function ProfileScreen() {
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
        <Text style={styles.userName}>User Name</Text>
        <Text style={styles.userEmail}>user@example.com</Text>
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
        <TouchableOpacity style={styles.optionItem}>
          <Icon name="user" size={24} color="#1a1a1a" />
          <Text style={styles.optionText}>Edit Profile</Text>
          <Icon name="chevron-right" size={24} color="#a0a0a0" style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Icon name="settings" size={24} color="#1a1a1a" />
          <Text style={styles.optionText}>Settings</Text>
          <Icon name="chevron-right" size={24} color="#a0a0a0" style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Icon name="bell" size={24} color="#1a1a1a" />
          <Text style={styles.optionText}>Notifications</Text>
          <Icon name="chevron-right" size={24} color="#a0a0a0" style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <Icon name="help-circle" size={24} color="#1a1a1a" />
          <Text style={styles.optionText}>Help & Support</Text>
          <Icon name="chevron-right" size={24} color="#a0a0a0" style={styles.optionIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
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
