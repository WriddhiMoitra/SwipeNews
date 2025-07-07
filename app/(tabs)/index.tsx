import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  SafeAreaView, 
  ScrollView,
  RefreshControl,
  Platform
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useFeed } from '../../contexts/FeedContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useAuth } from '../../contexts/AuthContext';
import ArticleCard from '../../components/ArticleCard';
import LoadingShimmer from '../../components/LoadingShimmer';
import OnboardingTooltip from '../../components/OnboardingTooltip';
import { Article } from '../../types/Article';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.75;

export default function HomeScreen() {
  const { state, refreshFeed, markAsRead, toggleSaveArticle } = useFeed();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { trackArticleRead, trackArticleSkipped, trackSwipeAction } = useAnalytics();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [articleStartTime, setArticleStartTime] = useState<Date>(new Date());
  
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    refreshFeed();
    // Show onboarding for new users
    if (user && state.articles.length === 0) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  useEffect(() => {
    setArticleStartTime(new Date());
  }, [currentIndex]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
    setCurrentIndex(0);
    translateY.value = 0;
  };

  const handleSwipeUp = async () => {
    if (currentIndex < state.articles.length - 1) {
      const article = state.articles[currentIndex];
      toggleSaveArticle(article.id);
      await trackSwipeAction('up', article.id, article.category);
      
      // Animate to next card
      translateY.value = withSpring(-CARD_HEIGHT, {
        damping: 20,
        stiffness: 300,
      }, () => {
        runOnJS(setCurrentIndex)(currentIndex + 1);
        translateY.value = 0;
      });
    }
  };

  const handleSwipeDown = async () => {
    if (currentIndex < state.articles.length - 1) {
      const article = state.articles[currentIndex];
      markAsRead(article.id);
      
      const timeSpent = (new Date().getTime() - articleStartTime.getTime()) / 1000;
      const readingTimeMinutes = Math.max(1, Math.round(timeSpent / 60));
      
      await trackArticleRead(article.id, article.category, article.source_id, readingTimeMinutes);
      await trackSwipeAction('down', article.id, article.category);
      
      // Animate to next card
      translateY.value = withSpring(CARD_HEIGHT, {
        damping: 20,
        stiffness: 300,
      }, () => {
        runOnJS(setCurrentIndex)(currentIndex + 1);
        translateY.value = 0;
      });
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
      
      // Scale and opacity effects
      const progress = Math.abs(event.translationY) / (CARD_HEIGHT * 0.3);
      scale.value = interpolate(
        progress,
        [0, 1],
        [1, 0.95],
        Extrapolate.CLAMP
      );
      opacity.value = interpolate(
        progress,
        [0, 1],
        [1, 0.8],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      const threshold = CARD_HEIGHT * 0.2;
      
      if (event.translationY < -threshold && event.velocityY < -500) {
        // Swipe up - Save article
        runOnJS(handleSwipeUp)();
      } else if (event.translationY > threshold && event.velocityY > 500) {
        // Swipe down - Next article
        runOnJS(handleSwipeDown)();
      } else {
        // Return to original position
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        opacity.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        scale: interpolate(
          Math.abs(translateY.value),
          [0, CARD_HEIGHT * 0.3],
          [0.9, 1],
          Extrapolate.CLAMP
        )
      }
    ],
    opacity: interpolate(
      Math.abs(translateY.value),
      [0, CARD_HEIGHT * 0.3],
      [0.5, 1],
      Extrapolate.CLAMP
    ),
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: theme.colors.background,
    },
    headerTitle: {
      fontSize: 32,
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
    },
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    card: {
      position: 'absolute',
      width: SCREEN_WIDTH - 32,
      height: CARD_HEIGHT,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 18,
      fontFamily: 'Inter-Medium',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
    swipeHint: {
      position: 'absolute',
      bottom: 120,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    swipeHintText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (state.isLoading && state.articles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SwipeNews</Text>
          <Text style={styles.headerSubtitle}>Loading your personalized feed...</Text>
        </View>
        <LoadingShimmer />
      </SafeAreaView>
    );
  }

  if (state.error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.emptyText}>
            {state.error}
          </Text>
          <Text style={[styles.emptyText, { marginTop: 10, fontSize: 16 }]}>
            Pull to refresh
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (state.articles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.emptyText}>
            No articles available at the moment.
          </Text>
          <Text style={[styles.emptyText, { marginTop: 10, fontSize: 16 }]}>
            Pull to refresh
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentArticle = state.articles[currentIndex];
  const nextArticle = state.articles[currentIndex + 1];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SwipeNews</Text>
        <Text style={styles.headerSubtitle}>
          {currentIndex + 1} of {state.articles.length} articles
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {/* Next card (behind) */}
        {nextArticle && (
          <Animated.View style={[styles.card, nextCardStyle]}>
            <ArticleCard
              article={nextArticle}
              onSave={() => toggleSaveArticle(nextArticle.id)}
              onShare={() => {}}
              isActive={false}
            />
          </Animated.View>
        )}

        {/* Current card */}
        {currentArticle && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, animatedStyle]}>
              <ArticleCard
                article={currentArticle}
                onSave={() => toggleSaveArticle(currentArticle.id)}
                onShare={() => {}}
                isActive={true}
              />
            </Animated.View>
          </GestureDetector>
        )}
      </View>

      {/* Swipe hints */}
      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>
          Swipe up to save • Swipe down for next
        </Text>
      </View>

      {/* Onboarding tooltip */}
      {showOnboarding && (
        <OnboardingTooltip
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </SafeAreaView>
  );
}