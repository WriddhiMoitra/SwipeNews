import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { isAuthenticated, user } = useAuth();

  return (
    <View style={styles.container}>
      {isAuthenticated && user ? (
        <>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.info}>Name: {user.name}</Text>
          <Text style={styles.info}>Email: {user.email}</Text>
        </>
      ) : (
        <Text style={styles.text}>Please log in to view your profile.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 18,
    color: '#888',
  },
});
