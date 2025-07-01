import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useFeed } from '../../contexts/FeedContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import NewsCard from '../../components/NewsCard';
import ArticleDetailScreen from '../../screens/ArticleDetailScreen';
import { Article } from '../../types/Article';

export default function SavedScreen() {
  const { state, toggleSaveArticle } = useFeed();
  const { theme } = useTheme();
  const { trackArticleShared } = useAnalytics();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const savedArticles = state.articles.filter(article => state.savedArticles.includes(article.id));

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
      backgroundColor: theme.colors.background,
      justifyContent: savedArticles.length === 0 ? 'center' : 'flex-start',
      alignItems: savedArticles.length === 0 ? 'center' : 'stretch',
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    listContainer: {
      padding: 16,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

  if (savedArticles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Articles</Text>
          <Text style={styles.headerSubtitle}>Your bookmarked articles will appear here</Text>
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.emptyText}>No saved articles yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Articles</Text>
        <Text style={styles.headerSubtitle}>{savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved</Text>
      </View>
      <FlatList
        data={savedArticles}
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
    </SafeAreaView>
  );
}

