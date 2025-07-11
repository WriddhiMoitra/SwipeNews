import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useFeed } from '../contexts/FeedContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { useEnhancedAnalytics } from '../contexts/EnhancedAnalyticsContext';
import { useNavigationTracking } from '../hooks/useNavigationTracking';
import Icon from 'react-native-vector-icons/Feather';
import { WifiOff } from 'lucide-react-native';
import NewsCard from '../components/NewsCard';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import { Article } from '../types/Article';
import { fallbackTheme } from '../constants/theme';
import { OfflineDownloadService } from '../services/offlineDownloadService';

export default function SimplifiedSavedScreen() {
  const { state, toggleSaveArticle } = useFeed();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { isOffline } = useOffline();
  const { trackArticleShared, trackSearch } = useEnhancedAnalytics();
  
  // Add navigation tracking
  useNavigationTracking('SimplifiedSavedScreen', true);
  const activeTheme = theme || fallbackTheme;
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  const offlineService = OfflineDownloadService.getInstance();

  useEffect(() => {
    loadOfflineCount();
  }, [state.savedArticles]);

  const loadOfflineCount = async () => {
    try {
      const offlineArticles = await offlineService.getOfflineArticles();
      setOfflineCount(offlineArticles.length);
    } catch (error) {
      console.error('Error loading offline count:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOfflineCount();
    setRefreshing(false);
  };

  const savedArticles = state.articles.filter(article => state.savedArticles.includes(article.id));
  const filteredArticles = searchQuery 
    ? savedArticles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : savedArticles;

  const handleSave = async (articleId: string) => {
    await toggleSaveArticle(articleId);
    await loadOfflineCount(); // Refresh offline count
  };

  const handleShare = async (url: string) => {
    const article = savedArticles.find(a => a.url === url);
    if (article && user?.id) {
      await trackArticleShared(article.id, article.category, article.source_id);
    }
  };

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBackFromDetail = () => {
    setSelectedArticle(null);
    loadOfflineCount(); // Refresh data when coming back
  };

  // Show article detail screen if an article is selected
  if (selectedArticle) {
    return (
      <ArticleDetailScreen
        article={selectedArticle}
        onBack={handleBackFromDetail}
      />
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: activeTheme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: activeTheme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: activeTheme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: activeTheme.colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: activeTheme.colors.textSecondary,
      marginTop: 4,
    },
    offlineIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isOffline ? '#FEF3C7' : '#F0F9FF',
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginTop: 4,
      borderRadius: 8,
    },
    offlineText: {
      fontSize: 12,
      color: isOffline ? '#92400E' : '#0369A1',
      marginLeft: 8,
      fontWeight: '600',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: activeTheme.colors.surface,
      borderRadius: 10,
      paddingHorizontal: 10,
      marginHorizontal: 20,
      marginTop: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: activeTheme.colors.border,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 16,
      color: activeTheme.colors.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      color: activeTheme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: activeTheme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    listContainer: {
      padding: 16,
    },
    offlineCount: {
      marginLeft: 8,
      fontSize: 16,
      color: activeTheme.colors.text,
      fontWeight: '500',
    },
  });

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bookmark" size={60} color={activeTheme.colors.textSecondary} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>
        {searchQuery ? 'No articles match your search' : 'No saved articles yet'}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchQuery 
          ? 'Try searching for something else' 
          : 'Save articles by swiping right or tapping the bookmark icon. They\'ll automatically be available offline!'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Articles</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <WifiOff color={activeTheme.colors.primary} size={18} />
          <Text style={styles.offlineCount}>{offlineCount} offline</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={activeTheme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved articles..."
          placeholderTextColor={activeTheme.colors.textSecondary}
          value={searchQuery}
          onChangeText={async (text) => {
            setSearchQuery(text);
            if (text.length > 2 && user?.id) {
              await trackSearch(text, [], undefined);
            }
          }}
        />
      </View>

      {filteredArticles.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredArticles}
          renderItem={({ item }) => (
            <NewsCard
              article={item}
              onSave={handleSave}
              onShare={handleShare}
              onReadMore={handleReadMore}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[activeTheme.colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}