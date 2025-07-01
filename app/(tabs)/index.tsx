import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useFeed } from '../../contexts/FeedContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import NewsCard from '../../components/NewsCard';
import ArticleDetailScreen from '../../screens/ArticleDetailScreen';
import { Article } from '../../types/Article';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const { state, refreshFeed, markAsRead, toggleSaveArticle } = useFeed();
  const { theme } = useTheme();
  const { trackArticleRead, trackArticleSaved, trackArticleShared } = useAnalytics();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    refreshFeed();
  }, []);

  const handleSwiped = async (index: number) => {
    if (state.articles[index]) {
      const article = state.articles[index];
      markAsRead(article.id);
      
      // Track reading analytics (estimate 2-3 minutes reading time)
      const estimatedReadingTime = Math.floor(Math.random() * 2) + 2;
      await trackArticleRead(article.id, article.category, article.source_id, estimatedReadingTime);
    }
  };

  const handleSave = async (articleId: string) => {
    const article = state.articles.find(a => a.id === articleId);
    if (article) {
      toggleSaveArticle(articleId);
      await trackArticleSaved(articleId, article.category, article.source_id);
    }
  };

  const handleShare = async (url: string) => {
    const article = state.articles.find(a => a.url === url);
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      color: theme.colors.text,
      fontWeight: '600',
    },
    errorText: {
      fontSize: 18,
      color: theme.colors.error,
      marginBottom: 10,
      fontWeight: '600',
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.text,
      marginBottom: 10,
      fontWeight: '600',
    },
    retryText: {
      fontSize: 16,
      color: theme.colors.primary,
      textDecorationLine: 'underline',
      fontWeight: '600',
    },
  });

  // Show article detail screen if an article is selected
  if (selectedArticle) {
    return (
      <ArticleDetailScreen
        article={selectedArticle}
        onBack={handleBackFromDetail}
      />
    );
  }

  if (state.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading articles...</Text>
      </SafeAreaView>
    );
  }

  if (state.error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{state.error}</Text>
        <Text style={styles.retryText} onPress={refreshFeed}>
          Retry
        </Text>
      </SafeAreaView>
    );
  }

  if (state.articles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>No articles available.</Text>
        <Text style={styles.retryText} onPress={refreshFeed}>
          Refresh
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Swiper
        cards={state.articles}
        renderCard={(article) => (
          <NewsCard
            article={article}
            onSave={handleSave}
            onShare={handleShare}
            onReadMore={handleReadMore}
          />
        )}
        onSwiped={handleSwiped}
        onSwipedAll={() => console.log('Swiped all cards')}
        cardIndex={0}
        backgroundColor={theme.colors.background}
        stackSize={2}
        stackSeparation={10}
        animateOverlayLabelsOpacity={false}
        animateCardOpacity={false}
        swipeBackCard={false}
        disableLeftSwipe={true}
        disableRightSwipe={true}
        disableTopSwipe={false}
        disableBottomSwipe={false}
        goBackToPreviousCardOnSwipeBottom={false}
        goBackToPreviousCardOnSwipeTop={false}
        containerStyle={styles.swiperContainer}
        cardVerticalMargin={20}
        cardHorizontalMargin={16}
        verticalSwipe={true}
        horizontalSwipe={false}
        verticalThreshold={50}
        horizontalThreshold={250}
        outputRotationRange={['-10deg', '0deg', '10deg']}
        inputRotationRange={[-50, 0, 50]}
        overlayLabels={{
          top: {
            title: 'READ LATER',
            style: {
              label: {
                backgroundColor: '#4CAF50',
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                borderRadius: 10,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }
            }
          },
          bottom: {
            title: 'NEXT',
            style: {
              label: {
                backgroundColor: '#FF5722',
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                borderRadius: 10,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }
            }
          }
        }}
      />
    </SafeAreaView>
  );
}
