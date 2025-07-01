import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchNewsSources, 
  getSourcesGroupedByCategory, 
  NewsSource, 
  NEWS_CATEGORIES,
  getCategoryById 
} from '../../services/newsSourcesService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserPreferences {
  language: string;
  country: string;
  categories: string[];
  sources: string[];
}

export default function SourcesScreen() {
  const { user } = useAuth();
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [groupedSources, setGroupedSources] = useState<{ [category: string]: NewsSource[] }>({});
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadUserPreferencesAndSources();
  }, [user]);

  const loadUserPreferencesAndSources = async () => {
    setIsLoading(true);
    try {
      // Load user preferences
      let preferences: UserPreferences | null = null;
      
      if (user && !user.isAnonymous) {
        const db = getFirestore();
        const userPrefDoc = await getDoc(doc(db, 'userPreferences', user.id));
        if (userPrefDoc.exists()) {
          preferences = userPrefDoc.data() as UserPreferences;
        }
      } else if (user && user.isAnonymous) {
        const localPrefs = await AsyncStorage.getItem('userPreferences');
        if (localPrefs) {
          preferences = JSON.parse(localPrefs);
        }
      }

      setUserPreferences(preferences);

      // Load sources based on preferences
      if (preferences) {
        const grouped = await getSourcesGroupedByCategory(
          preferences.language || 'en',
          preferences.country || 'india'
        );
        setGroupedSources(grouped);
        
        // Flatten all sources for the 'all' view
        const allSources: NewsSource[] = [];
        Object.values(grouped).forEach(categorySources => {
          allSources.push(...categorySources);
        });
        setSources(allSources);
      } else {
        // Default to all sources if no preferences
        const allSources = await fetchNewsSources();
        setSources(allSources);
        
        const grouped = await getSourcesGroupedByCategory();
        setGroupedSources(grouped);
      }
    } catch (error) {
      console.error('Error loading sources:', error);
      Alert.alert('Error', 'Failed to load news sources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserPreferencesAndSources();
    setRefreshing(false);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      const allSources: NewsSource[] = [];
      Object.values(groupedSources).forEach(categorySources => {
        allSources.push(...categorySources);
      });
      setSources(allSources);
    } else {
      setSources(groupedSources[categoryId] || []);
    }
  };

  const renderCategoryTab = ({ item }: { item: any }) => {
    const isSelected = selectedCategory === item.id;
    const category = getCategoryById(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryTab,
          isSelected ? { ...styles.selectedCategoryTab, backgroundColor: category?.color || '#E50914' } : null
        ]}
        onPress={() => handleCategorySelect(item.id)}
      >
        <Icon 
          name={category?.icon || 'globe'} 
          size={16} 
          color={isSelected ? '#fff' : category?.color || '#666'} 
        />
        <Text style={[
          styles.categoryTabText,
          isSelected ? styles.selectedCategoryTabText : { color: category?.color || '#666' }
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSourceItem = ({ item }: { item: NewsSource }) => {
    const category = getCategoryById(item.category);
    const isUserSelected = userPreferences?.sources?.includes(item.id) || false;
    
    return (
      <View style={styles.sourceItem}>
        <View style={styles.sourceHeader}>
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceName}>{item.name}</Text>
            <View style={styles.sourceMetadata}>
              <View style={[styles.categoryBadge, { backgroundColor: category?.color || '#666' }]}>
                <Icon name={category?.icon || 'globe'} size={12} color="#fff" />
                <Text style={styles.categoryBadgeText}>{category?.name || item.category}</Text>
              </View>
              <Text style={styles.sourceLanguage}>{item.language.toUpperCase()}</Text>
              <Text style={styles.sourceCountry}>{item.country}</Text>
            </View>
          </View>
          {isUserSelected && (
            <View style={styles.selectedIndicator}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
            </View>
          )}
        </View>
        
        {item.region && (
          <View style={styles.regionContainer}>
            <Icon name="map-pin" size={12} color="#666" />
            <Text style={styles.regionText}>{item.region}</Text>
          </View>
        )}
        
        <Text style={styles.sourceUrl} numberOfLines={1}>{item.url}</Text>
        
        <View style={styles.sourceFooter}>
          <Text style={styles.lastSynced}>
            Last synced: {new Date(item.last_synced).toLocaleDateString()}
          </Text>
          <View style={[styles.statusIndicator, { backgroundColor: item.active ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.statusText}>{item.active ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const categories = [
    { id: 'all', name: 'All Sources' },
    ...NEWS_CATEGORIES
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loader" size={40} color="#E50914" />
        <Text style={styles.loadingText}>Loading news sources...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>News Sources</Text>
        <Text style={styles.headerSubtext}>
          {sources.length} sources available
        </Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryTab}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Sources List */}
      <FlatList
        data={sources}
        renderItem={renderSourceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.sourcesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E50914']}
            tintColor="#E50914"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="globe" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No sources found</Text>
            <Text style={styles.emptySubtext}>
              {selectedCategory === 'all' 
                ? 'Try refreshing or check your preferences'
                : 'No sources available for this category'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 14,
    color: '#666',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  selectedCategoryTab: {
    borderColor: 'transparent',
  },
  categoryTabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryTabText: {
    color: '#fff',
  },
  sourcesList: {
    padding: 16,
  },
  sourceItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  sourceMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  sourceLanguage: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  sourceCountry: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  regionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  regionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  sourceUrl: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  sourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSynced: {
    fontSize: 12,
    color: '#999',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
