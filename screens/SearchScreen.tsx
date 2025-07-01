import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';

export default function SearchScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  // Fallback theme in case context is not available
  const fallbackTheme = {
    colors: {
      primary: '#E50914',
      text: '#1a1a1a',
      textSecondary: '#666666',
      background: '#ffffff',
      card: '#ffffff',
      border: '#e0e0e0',
      shadow: '#000000',
      surface: '#f5f5f5',
      surfaceVariant: '#f0f0f0',
      outline: '#cccccc',
      success: '#4CAF50',
      error: '#F44336',
    },
  };
  const activeTheme = theme || fallbackTheme;
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </View>
      <View style={[styles.searchContainer, { backgroundColor: activeTheme.colors.surface, borderColor: activeTheme.colors.border }]}>
        <Icon name="search" size={20} color={activeTheme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles, topics, or sources..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView style={styles.contentContainer}>
        {searchQuery === '' ? (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={60} color={activeTheme.colors.textSecondary} />
            <Text style={styles.emptyText}>Enter a search term to find articles</Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>Searching for "{searchQuery}"</Text>
            <Text style={styles.noResultsText}>No results found. Try a different search term.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1a1a1a',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
