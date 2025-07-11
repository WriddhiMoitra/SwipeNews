import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { useEnhancedAnalytics } from '../contexts/EnhancedAnalyticsContext';
import { useNavigationTracking } from '../hooks/useNavigationTracking';
import { fallbackTheme } from '../constants/theme';

export default function SearchScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const activeTheme = theme || fallbackTheme;
  const { trackSearch, trackPerformance, trackError } = useEnhancedAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Add navigation tracking
  useNavigationTracking('SearchScreen', true);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const searchStartTime = Date.now();
    setLoading(true);
    
    try {
      // Simulate search - replace with actual search implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResults = searchQuery.length > 2 ? [
        { id: '1', title: `Result for "${searchQuery}"`, description: 'Mock search result' },
        { id: '2', title: `Another result for "${searchQuery}"`, description: 'Another mock result' }
      ] : [];
      
      setSearchResults(mockResults);
      
      // Track search performance
      const searchTime = Date.now() - searchStartTime;
      await trackPerformance('search_time', searchTime, 'SearchScreen');
      
      // Track search with results
      await trackSearch(searchQuery, [], mockResults.length);
      
    } catch (error) {
      console.error('Search failed:', error);
      await trackError('search_error', error.message, 'SearchScreen');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timeoutId = setTimeout(handleSearch, 500); // Debounce search
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

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
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      <ScrollView style={styles.contentContainer}>
        {searchQuery === '' ? (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={60} color={activeTheme.colors.textSecondary} />
            <Text style={styles.emptyText}>Enter a search term to find articles</Text>
            <Text style={styles.emptySubtext}>Search through thousands of articles, topics, and sources</Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={activeTheme.colors.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</Text>
            {searchResults.map((result) => (
              <View key={result.id} style={[styles.resultItem, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
                <Text style={[styles.resultTitle, { color: activeTheme.colors.text }]}>{result.title}</Text>
                <Text style={[styles.resultDescription, { color: activeTheme.colors.textSecondary }]}>{result.description}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Icon name="search" size={60} color={activeTheme.colors.textSecondary} />
            <Text style={[styles.noResultsText, { color: activeTheme.colors.text }]}>No results found for "{searchQuery}"</Text>
            <Text style={[styles.noResultsSubtext, { color: activeTheme.colors.textSecondary }]}>Try different keywords or check your spelling</Text>
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
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  resultItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  noResultsSubtext: {
    fontSize: 14,
    marginTop: 8,
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
