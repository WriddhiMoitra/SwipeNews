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
        backgroundColor={'#000000'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    color: '#ffffff',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#FF5722',
    marginBottom: 10,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10,
    fontWeight: '600',
  },
  retryText: {
    fontSize: 16,
    color: '#FF5722',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
