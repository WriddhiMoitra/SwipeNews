import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function PreferencesScreen({ onPreferencesSet }: { onPreferencesSet: () => void }) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const regions = [
    { id: 'global', name: 'Global' },
    { id: 'us', name: 'United States' },
    { id: 'uk', name: 'United Kingdom' },
    { id: 'india', name: 'India' },
    { id: 'europe', name: 'Europe' },
  ];

  const languages = [
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Spanish' },
    { id: 'fr', name: 'French' },
    { id: 'de', name: 'German' },
    { id: 'hi', name: 'Hindi' },
  ];

  const handleSavePreferences = async () => {
    if (!selectedRegion || !selectedLanguage) {
      Alert.alert('Error', 'Please select both a region and a language.');
      return;
    }

    setIsLoading(true);
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user && !user.isAnonymous) {
      try {
        await setDoc(doc(db, 'userPreferences', user.uid), {
          region: selectedRegion,
          language: selectedLanguage,
          setAt: new Date().toISOString(),
        });
        Alert.alert('Success', 'Preferences saved successfully!');
        onPreferencesSet();
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to save preferences. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // For anonymous users, store preferences locally
      try {
        await AsyncStorage.setItem('userPreferences', JSON.stringify({
          region: selectedRegion,
          language: selectedLanguage,
          setAt: new Date().toISOString(),
        }));
        Alert.alert('Success', 'Preferences saved locally!');
        onPreferencesSet();
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to save preferences locally. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        selectedRegion === item.id || selectedLanguage === item.id ? styles.selectedOption : null,
      ]}
      onPress={() => {
        if (regions.some(r => r.id === item.id)) {
          setSelectedRegion(item.id);
        } else {
          setSelectedLanguage(item.id);
        }
      }}
    >
      <Text style={styles.optionText}>{item.name}</Text>
      {(selectedRegion === item.id || selectedLanguage === item.id) && (
        <Icon name="check" size={20} color="#E50914" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Preferences</Text>
      <Text style={styles.subtitle}>Select your preferred region and language for news content.</Text>

      <Text style={styles.sectionTitle}>Region</Text>
      <FlatList
        data={regions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
      />

      <Text style={styles.sectionTitle}>Language</Text>
      <FlatList
        data={languages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSavePreferences}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Save Preferences'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  list: {
    flexGrow: 0,
    marginBottom: 30,
  },
  listContainer: {
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#fafafa',
  },
  optionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
