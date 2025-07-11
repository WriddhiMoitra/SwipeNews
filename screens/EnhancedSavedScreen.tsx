import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useFeed } from '../contexts/FeedContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { useEnhancedAnalytics } from '../contexts/EnhancedAnalyticsContext';
import { useNavigationTracking } from '../hooks/useNavigationTracking';
import Icon from 'react-native-vector-icons/Feather';
import NewsCard from '../components/NewsCard';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import { Article } from '../types/Article';
import { fallbackTheme } from '../constants/theme';
import { OfflineDownloadService } from '../services/offlineDownloadService';
import { ProgressTrackingService } from '../services/progressTrackingService';
import { OfflineArticle, ReadingProgress } from '../types/Gamification';

export default function EnhancedSavedScreen() {
  const { state, toggleSaveArticle } = useFeed();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { isOffline } = useOffline();
  const { trackArticleShared, trackSearch, trackContentEngagement } = useEnhancedAnalytics();
  
  // Add navigation tracking
  useNavigationTracking('EnhancedSavedScreen', true);
  const activeTheme = theme || fallbackTheme;
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'saved' | 'offline' | 'progress'>('saved');
  const [offlineArticles, setOfflineArticles] = useState<OfflineArticle[]>([]);
  const [inProgressArticles, setInProgressArticles] = useState<ReadingProgress[]>([]);
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);
  
  const offlineService = OfflineDownloadService.getInstance();
  const progressService = ProgressTrackingService.getInstance();

  useEffect(() => {
    loadOfflineData();
  }, [user]);

  const loadOfflineData = async () => {
    if (!user) return;
    
    try {
      const [offline, progress] = await Promise.all([
        offlineService.getOfflineArticles(),
        progressService.getInProgressArticles(user.uid)
      ]);
      
      setOfflineArticles(offline);
      setInProgressArticles(progress);
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const savedArticles = state.articles.filter(article => state.savedArticles.includes(article.id));
  
  const getFilteredArticles = () => {
    let articles = savedArticles;
    
    if (showOfflineOnly) {
      articles = articles.filter(article => 
        offlineArticles.some(offline => offline.id === article.id)
      );
    }
    
    if (searchQuery) {
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return articles;
  };

  const handleSave = (articleId: string) => {
    toggleSaveArticle(articleId);
  };

  const handleShare = async (url: string) => {
    const article = savedArticles.find(a => a.url === url);
    if (article) {
      await trackArticleShared(article.id, article.category, article.source_id);
    }
  };

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBackFromDetail = () => {
    setSelectedArticle(null);
    loadOfflineData(); // Refresh data when coming back
  };

  const handleDeleteOfflineArticle = async (articleId: string) => {
    Alert.alert(
      'Delete Offline Article',
      'Are you sure you want to delete this offline article?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await offlineService.deleteOfflineArticle(articleId);
            loadOfflineData();
          }
        }
      ]
    );
  };

  const handleClearAllOffline = async () => {
    Alert.alert(
      'Clear All Offline Articles',
      'This will delete all downloaded articles. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await offlineService.clearAllOfflineArticles();
            loadOfflineData();
          }
        }
      ]
    );
  };

  const renderOfflineArticle = ({ item }: { item: OfflineArticle }) => (
    <View style={styles.offlineCard}>
      <NewsCard
        article={item.article}
        onSave={handleSave}
        onShare={handleShare}
        onReadMore={handleReadMore}
      />
      <View style={styles.offlineInfo}>
        <Text style={styles.offlineText}>
          Downloaded: {item.downloadedAt.toLocaleDateString()}
        </Text>
        <Text style={styles.offlineSize}>
          Size: {(item.fileSize / 1024 / 1024).toFixed(2)} MB
        </Text>
        <TouchableOpacity
          onPress={() => handleDeleteOfflineArticle(item.id)}
          style={styles.deleteButton}
        >
          <Icon name="trash-2" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProgressArticle = ({ item }: { item: ReadingProgress }) => {
    const article = savedArticles.find(a => a.id === item.articleId);
    if (!article) return null;

    return (
      <View style={styles.progressCard}>
        <NewsCard
          article={article}
          onSave={handleSave}
          onShare={handleShare}
          onReadMore={handleReadMore}
        />
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Progress: {Math.round(item.scrollPosition)}%
          </Text>
          <Text style={styles.progressTime}>
            Time spent: {Math.round(item.timeSpent / 60)} min
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.scrollPosition}%` }]} />
          </View>
        </View>
      </View>
    );
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

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'saved':
        const filteredArticles = getFilteredArticles();
        return (
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="bookmark" size={60} color={activeTheme.colors.textSecondary} />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No articles match your search.' : 'No saved articles yet.'}
                </Text>
              </View>
            }
          />
        );
      
      case 'offline':
        return (
          <FlatList
            data={offlineArticles}
            renderItem={renderOfflineArticle}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              offlineArticles.length > 0 ? (
                <View style={styles.offlineHeader}>
                  <Text style={styles.offlineHeaderText}>
                    {offlineArticles.length} articles downloaded
                  </Text>
                  <TouchableOpacity onPress={handleClearAllOffline} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="download" size={60} color={activeTheme.colors.textSecondary} />
                <Text style={styles.emptyText}>No offline articles yet.</Text>
                <Text style={styles.emptySubtext}>
                  Download articles to read them offline
                </Text>
              </View>
            }
          />
        );
      
      case 'progress':
        return (
          <FlatList
            data={inProgressArticles}
            renderItem={renderProgressArticle}
            keyExtractor={item => item.articleId}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="clock" size={60} color={activeTheme.colors.textSecondary} />
                <Text style={styles.emptyText}>No articles in progress.</Text>
                <Text style={styles.emptySubtext}>
                  Start reading articles to track your progress
                </Text>
              </View>
            }
          />
        );
      
      default:
        return null;
    }
  };

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
    filterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: activeTheme.colors.surface,
    },
    filterText: {
      fontSize: 14,
      color: activeTheme.colors.text,
      fontWeight: '600',
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: activeTheme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: activeTheme.colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
      marginHorizontal: 4,
    },
    activeTab: {
      backgroundColor: activeTheme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: activeTheme.colors.textSecondary,
    },
    activeTabText: {
      color: 'white',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      color: activeTheme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      marginTop: 20,
    },
    emptySubtext: {
      fontSize: 14,
      color: activeTheme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    listContainer: {
      padding: 16,
    },
    offlineCard: {
      marginBottom: 16,
    },
    offlineInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: activeTheme.colors.surface,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    offlineText: {
      fontSize: 12,
      color: activeTheme.colors.textSecondary,
    },
    offlineSize: {
      fontSize: 12,
      color: activeTheme.colors.textSecondary,
    },
    deleteButton: {
      padding: 8,
    },
    offlineHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 4,
    },
    offlineHeaderText: {
      fontSize: 16,
      fontWeight: '600',
      color: activeTheme.colors.text,
    },
    clearButton: {
      backgroundColor: '#EF4444',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    clearButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    progressCard: {
      marginBottom: 16,
    },
    progressInfo: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: activeTheme.colors.surface,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    progressText: {
      fontSize: 14,
      fontWeight: '600',
      color: activeTheme.colors.text,
      marginBottom: 4,
    },
    progressTime: {
      fontSize: 12,
      color: activeTheme.colors.textSecondary,
      marginBottom: 8,
    },
    progressBar: {
      height: 4,
      backgroundColor: activeTheme.colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: activeTheme.colors.primary,
      borderRadius: 2,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <Text style={styles.headerSubtitle}>
          {selectedTab === 'saved' && `${getFilteredArticles().length} saved articles`}
          {selectedTab === 'offline' && `${offlineArticles.length} offline articles`}
          {selectedTab === 'progress' && `${inProgressArticles.length} in progress`}
        </Text>
      </View>

      {/* Search */}
      {selectedTab === 'saved' && (
        <>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={activeTheme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search saved articles..."
              value={searchQuery}
              onChangeText={async (text) => {
                setSearchQuery(text);
                if (text.length > 2) {
                  const results = getFilteredArticles();
                  await trackSearch(text, ['saved_articles'], results.length);
                }
              }}
            />
          </View>

          {/* Offline Filter */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterText}>Show offline only</Text>
            <Switch
              value={showOfflineOnly}
              onValueChange={setShowOfflineOnly}
              trackColor={{ false: activeTheme.colors.border, true: activeTheme.colors.primary }}
            />
          </View>
        </>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'saved', label: 'Saved', icon: 'bookmark' },
          { key: 'offline', label: 'Offline', icon: 'download' },
          { key: 'progress', label: 'Reading', icon: 'clock' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {renderTabContent()}
    </SafeAreaView>
  );
}