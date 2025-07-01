import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useFeed } from '../../contexts/FeedContext';
import NewsCard from '../../components/NewsCard';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const { state, refreshFeed, markAsRead, toggleSaveArticle } = useFeed();

  useEffect(() => {
    refreshFeed();
  }, []);

  const handleSwiped = (index: number) => {
    if (state.articles[index]) {
      markAsRead(state.articles[index].id);
    }
  };

  const handleSave = (articleId: string) => {
    toggleSaveArticle(articleId);
  };

  const handleShare = (url: string) => {
    // Placeholder for share functionality
    console.log('Sharing article:', url);
  };

  if (state.isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading articles...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{state.error}</Text>
        <Text style={styles.retryText} onPress={refreshFeed}>
          Retry
        </Text>
      </View>
    );
  }

  if (state.articles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No articles available.</Text>
        <Text style={styles.retryText} onPress={refreshFeed}>
          Refresh
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        cards={state.articles}
        renderCard={(article) => (
          <NewsCard
            article={article}
            onSave={handleSave}
            onShare={handleShare}
          />
        )}
        onSwiped={handleSwiped}
        onSwipedAll={() => console.log('Swiped all cards')}
        cardIndex={0}
        backgroundColor={'#f5f5f5'}
        stackSize={3}
        stackSeparation={15}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
        containerStyle={styles.swiperContainer}
        cardVerticalMargin={height * 0.1}
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
  swiperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
  errorText: {
    fontSize: 18,
    color: '#E50914',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 16,
    color: '#E50914',
    textDecorationLine: 'underline',
  },
});
