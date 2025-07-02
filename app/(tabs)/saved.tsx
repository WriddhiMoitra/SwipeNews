import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useFeed } from '../../contexts/FeedContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import Icon from 'react-native-vector-icons/Feather';
import NewsCard from '../../components/NewsCard';
import ArticleDetailScreen from '../../screens/ArticleDetailScreen';
import { Article } from '../../types/Article';
import { fallbackTheme } from '../../constants/theme';

export default function SavedScreen() {
  const { state, toggleSaveArticle } = useFeed();
  const { theme } = useTheme();
  const { trackArticleShared } = useAnalytics();
  const activeTheme = theme || fallbackTheme;
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const savedArticles = state.articles.filter(article => state.savedArticles.includes(article.id));
  const filteredArticles = searchQuery 
    ? savedArticles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : savedArticles;

  const handleSave = (articleId: string) => {
    toggleSaveArticle(articleId);
  };

  const handleShare = async (url: string) => {
    const article = savedArticles.find(a => a.url === url);
    if (article) {
      await trackArticleShared(article.id, article.category, article.source_id);
    }
    // Share functionality is now handled in NewsCard component
  };

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBackFromDetail = () => {
    setSelectedArticle(null);
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
      justifyContent: filteredArticles.length === 0 ? 'center' : 'flex-start',
      alignItems: filteredArticles.length === 0 ? 'center' : 'stretch',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 18,
      color: activeTheme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      marginTop: 20,
    },
    listContainer: {
      padding: 16,
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
  });

  if (savedArticles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Articles</Text>
          <Text style={styles.headerSubtitle}>Your bookmarked articles will appear here</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="bookmark" size={60} color={activeTheme.colors.textSecondary} />
          <Text style={styles.emptyText}>No saved articles yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Articles</Text>
        <Text style={styles.headerSubtitle}>{filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} saved</Text>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={activeTheme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {filteredArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="search" size={60} color={activeTheme.colors.textSecondary} />
          <Text style={styles.emptyText}>No articles match your search.</Text>
        </View>
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
        />
      )}
    </SafeAreaView>
  );
}
