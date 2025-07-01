import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFeed } from '../../contexts/FeedContext';
import NewsCard from '../../components/NewsCard';

export default function SavedScreen() {
  const { state, toggleSaveArticle } = useFeed();

  const savedArticles = state.articles.filter(article => state.savedArticles.includes(article.id));

  const handleSave = (articleId: string) => {
    toggleSaveArticle(articleId);
  };

  const handleShare = (url: string) => {
    // Placeholder for share functionality
    console.log('Sharing article:', url);
  };

  if (savedArticles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No saved articles.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedArticles}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            onSave={handleSave}
            onShare={handleShare}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  listContainer: {
    padding: 10,
  },
});
