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
  Extrapolate,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { useFeed } from '../../contexts/FeedContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useEnhancedAnalytics } from '../../contexts/EnhancedAnalyticsContext';
import { useNavigationTracking } from '../../hooks/useNavigationTracking';
import { useAuth } from '../../contexts/AuthContext';
import ArticleCard from '../../components/ArticleCard';
import LoadingShimmer from '../../components/LoadingShimmer';
import OnboardingTooltip from '../../components/OnboardingTooltip';
import { Article } from '../../types/Article';
import ArticleDetailScreen from '../../screens/ArticleDetailScreen';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.78;
const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 800;
const MAX_SWIPE_DISTANCE = CARD_HEIGHT * 0.6;

/**
 * HomeScreen displays the main news feed with immersive card-based navigation.
 *
 * Features:
 * - Swipe up/down: next/previous article
 * - Swipe right: save to bookmarks
 * - Spring-based animations, card rotation, haptic feedback
 * - Progress indicator, loading shimmer, error handling
 * - Accessibility and performance optimized
 */
export default function HomeScreen() {
  const { state, refreshFeed, markAsRead, toggleSaveArticle } = useFeed();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { 
    trackArticleRead, 
    trackArticleSkipped, 
    trackSwipeAction, 
    trackContentEngagement,
    trackPerformance,
    trackError 
  } = useEnhancedAnalytics();
  
  // Add navigation tracking
  useNavigationTracking('HomeScreen', true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [articleStartTime, setArticleStartTime] = useState<Date>(new Date());
  const [detailArticle, setDetailArticle] = useState<Article | null>(null);
  const [detailStartTime, setDetailStartTime] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const nextCardScale = useSharedValue(0.95);
  const nextCardOpacity = useSharedValue(0.7);
  const rotate = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    refreshFeed();
    // Show onboarding for new users after a delay
    if (user && state.articles.length === 0) {
      setTimeout(() => setShowOnboarding(true), 2000);
    }
  }, []);

  useEffect(() => {
    setArticleStartTime(new Date());
  }, [currentIndex]);

  const onRefresh = async () => {
    const refreshStartTime = Date.now();
    setRefreshing(true);
    try {
      await refreshFeed();
      
      // Track feed refresh performance
      const refreshTime = Date.now() - refreshStartTime;
      await trackPerformance('feed_load_time', refreshTime, 'HomeScreen');
      
      // Track content engagement
      await trackContentEngagement('interaction_timing', {
        action: 'feed_refreshed',
        articleCount: state.articles.length,
        timeOfDay: new Date().getHours().toString(),
        dayOfWeek: new Date().getDay().toString(),
      });
    } catch (error) {
      console.error('Error refreshing feed:', error);
      await trackError('feed_refresh_error', error.message, 'HomeScreen');
    } finally {
      setRefreshing(false);
      setCurrentIndex(0);
      translateY.value = 0;
      scale.value = 1;
      opacity.value = 1;
    }
  };

  const handleSwipeUp = async () => {
    if (currentIndex < state.articles.length - 1) {
      const article = state.articles[currentIndex];
      toggleSaveArticle(article.id);
      await trackSwipeAction('up', article.id, article.category);
      // Animate to next card
      translateY.value = withSpring(-MAX_SWIPE_DISTANCE, {
        damping: 25,
        stiffness: 400,
      }, () => {
        runOnJS(setCurrentIndex)(currentIndex + 1);
        translateY.value = 0;
        scale.value = 1;
        opacity.value = 1;
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
      translateY.value = withSpring(MAX_SWIPE_DISTANCE, {
        damping: 25,
        stiffness: 400,
      }, () => {
        runOnJS(setCurrentIndex)(currentIndex + 1);
        translateY.value = 0;
        scale.value = 1;
        opacity.value = 1;
      });
    }
  };

  // Implement swipe right animation for saving articles
  const handleSaveRightSwipe = async () => {
    if (currentIndex < state.articles.length) {
      const article = state.articles[currentIndex];
      toggleSaveArticle(article.id);
      // Track as a custom action if needed, avoiding invalid 'right'
      // Optionally, track as a different direction if analytics require
      // await trackSwipeAction('up', article.id, article.category);
      // Animate card off to the right with a smooth transition
      translateX.value = withTiming(SCREEN_WIDTH, { duration: 400 });
      opacity.value = withTiming(0, { duration: 400 });
      rotate.value = withTiming(10, { duration: 400 });
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        translateX.value = 0;
        translateY.value = 0;
        scale.value = 1;
        opacity.value = 1;
        rotate.value = 0;
      }, 400);
    }
  };

  // Define handleNextArticle and handlePrevArticle before panGesture
  const handleNextArticle = async () => {
    if (currentIndex < state.articles.length - 1) {
      const article = state.articles[currentIndex];
      markAsRead(article.id);
      const timeSpent = (new Date().getTime() - articleStartTime.getTime()) / 1000;
      const readingTimeMinutes = Math.max(1, Math.round(timeSpent / 60));
      await trackArticleRead(article.id, article.category, article.source_id, readingTimeMinutes);
      await trackSwipeAction('down', article.id, article.category);
      // Immediate index update for seamless transition, no delay or loading effect
      runOnJS(setCurrentIndex)(currentIndex + 1);
      // Use withTiming for ultra-smooth, fluid transition with minimal lag
      translateY.value = withTiming(-CARD_HEIGHT, { duration: 300 }, () => {
        translateY.value = 0;
        scale.value = 1;
        opacity.value = 1;
        rotate.value = 0; // Ensure rotation is reset
      });
    }
  };

  const handlePrevArticle = async () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const article = state.articles[prevIndex];
      await trackSwipeAction('up', article.id, article.category);
      // Immediate index update for seamless transition
      runOnJS(setCurrentIndex)(prevIndex);
      // Use withTiming for ultra-smooth, fluid transition with minimal lag
      translateY.value = withTiming(CARD_HEIGHT, { duration: 300 }, () => {
        translateY.value = 0;
        scale.value = 1;
        opacity.value = 1;
        rotate.value = 0; // Ensure rotation is reset
      });
    }
  };

  /**
   * Handles saving the current article via right swipe gesture.
   * Provides haptic feedback and spring animation.
   */
  // --- Refactored panGesture for fluid stack swipe ---
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only vertical translation for up/down
      let clampedY = Math.max(-MAX_SWIPE_DISTANCE, Math.min(event.translationY, MAX_SWIPE_DISTANCE));
      translateY.value = clampedY;
      translateX.value = 0; // No horizontal movement for up/down
      // Progress for stack effect
      let progressY = Math.abs(clampedY) / (SWIPE_THRESHOLD * 1.2); // Smoother progress
      let clampedProgressY = Math.min(progressY, 1);
      // Animate current card
      scale.value = 1 - (clampedProgressY * 0.07);
      opacity.value = 1 - (clampedProgressY * 0.25);
      rotate.value = 0; // No tilt for up/down
      // Animate next/prev card for stack effect
      if (clampedY < 0 && currentIndex < state.articles.length - 1) {
        // Swiping up, show next card
        nextCardScale.value = 0.95 + (clampedProgressY * 0.05);
        nextCardOpacity.value = 0.7 + (clampedProgressY * 0.3);
      } else if (clampedY > 0 && currentIndex > 0) {
        // Swiping down, show previous card
        nextCardScale.value = 0.95 + (clampedProgressY * 0.05);
        nextCardOpacity.value = 0.7 + (clampedProgressY * 0.3);
      } else {
        nextCardScale.value = 0.95;
        nextCardOpacity.value = 0.7;
      }
    })
    .onEnd((event) => {
      const shouldSwipeUp = event.translationY < -SWIPE_THRESHOLD && event.velocityY < -VELOCITY_THRESHOLD;
      const shouldSwipeDown = event.translationY > SWIPE_THRESHOLD && event.velocityY > VELOCITY_THRESHOLD;
      if (shouldSwipeUp && currentIndex < state.articles.length - 1) {
        // Animate out, then update index
        translateY.value = withTiming(-CARD_HEIGHT, { duration: 260 }, () => {
          runOnJS(setCurrentIndex)(currentIndex + 1);
          translateY.value = 0;
          scale.value = 1;
          opacity.value = 1;
          nextCardScale.value = 0.95;
          nextCardOpacity.value = 0.7;
        });
      } else if (shouldSwipeDown && currentIndex > 0) {
        translateY.value = withTiming(CARD_HEIGHT, { duration: 260 }, () => {
          runOnJS(setCurrentIndex)(currentIndex - 1);
          translateY.value = 0;
          scale.value = 1;
          opacity.value = 1;
          nextCardScale.value = 0.95;
          nextCardOpacity.value = 0.7;
        });
      } else {
        // Reset
        translateY.value = withTiming(0, { duration: 220 });
        scale.value = withTiming(1, { duration: 220 });
        opacity.value = withTiming(1, { duration: 220 });
        nextCardScale.value = withTiming(0.95, { duration: 220 });
        nextCardOpacity.value = withTiming(0.7, { duration: 220 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotateZ: `${rotate.value}deg` }
      ],
      opacity: opacity.value,
    };
  });

  // --- nextCardStyle: stack effect ---
  const nextCardStyle = useAnimatedStyle(() => {
    // Stack effect: next card follows swipe progress
    let nextCardTranslateY = 0;
    if (translateY.value < 0) {
      // Swiping up, next card comes up
      nextCardTranslateY = CARD_HEIGHT * 0.1 + (translateY.value * 0.5);
    } else if (translateY.value > 0) {
      // Swiping down, previous card comes down
      nextCardTranslateY = -CARD_HEIGHT * 0.1 + (translateY.value * 0.5);
    }
    return {
      transform: [{ scale: nextCardScale.value }, { translateY: nextCardTranslateY }],
      opacity: nextCardOpacity.value,
    };
  });

  

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      paddingHorizontal: 4,
    },
    progressBar: {
      flex: 1,
      height: 4,
      backgroundColor: theme.colors.surface,
      borderRadius: 2,
      marginRight: 12,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.colors.textSecondary,
      minWidth: 60,
      textAlign: 'right',
    },
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      position: 'absolute',
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
      lineHeight: 26,
    },
    swipeHint: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 120 : 100,
      left: 0,
      right: 0,
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    swipeHintContainer: {
      backgroundColor: theme.colors.card,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    swipeHintText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  const handleOpenDetail = (article: Article) => {
    setDetailArticle(article);
    setDetailStartTime(Date.now());
  };

  const handleCloseDetail = async () => {
    if (detailArticle && detailStartTime) {
      const timeSpent = Math.round((Date.now() - detailStartTime) / 1000);
      await trackArticleRead(detailArticle.id, detailArticle.category, detailArticle.source_id, Math.max(1, Math.round(timeSpent / 60)));
    }
    setDetailArticle(null);
    setDetailStartTime(null);
  };

  if (detailArticle) {
    return (
      <ArticleDetailScreen article={detailArticle} onBack={handleCloseDetail} />
    );
  }

  if (state.isLoading && state.articles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
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
  const progressPercentage = ((currentIndex + 1) / state.articles.length) * 100;

  

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.cardContainer}>
        {/* Always render previous card if available for seamless transition */}
        {currentIndex > 0 && (
          <Animated.View style={[styles.card, { zIndex: 1 }, nextCardStyle]}>
            <ArticleCard
              article={state.articles[currentIndex - 1]}
              onSave={() => toggleSaveArticle(state.articles[currentIndex - 1].id)}
              onShare={() => {}}
              isActive={false}
              index={-1}
            />
          </Animated.View>
        )}

        {/* Current card with error boundary approach */}
        {currentArticle && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, { zIndex: 2 }, animatedStyle]}>
              <ArticleCard
                article={currentArticle}
                onSave={() => {
                  try {
                    toggleSaveArticle(currentArticle.id);
                  } catch (error) {
                    console.error("Error saving article:", error);
                  }
                }}
                onShare={() => {
                  try {
                    // Share logic here
                  } catch (error) {
                    console.error("Error sharing article:", error);
                  }
                }}
                isActive={true}
                index={0}
                onReadMore={() => handleOpenDetail(currentArticle)}
              />
            </Animated.View>
          </GestureDetector>
        )}

        {/* Always render next card if available for seamless transition */}
        {nextArticle && (
          <Animated.View style={[styles.card, { zIndex: 1 }, nextCardStyle]}>
            <ArticleCard
              article={nextArticle}
              onSave={() => toggleSaveArticle(nextArticle.id)}
              onShare={() => {}}
              isActive={false}
              index={1}
              onReadMore={() => handleOpenDetail(nextArticle)}
            />
          </Animated.View>
        )}
      </View>

      {/* Swipe hints */}
      {currentIndex === 0 && (
      <View style={styles.swipeHint} accessible accessibilityLabel="Swipe up for next, down to skip, right to save">
        <View style={styles.swipeHintContainer}>
          <Text style={styles.swipeHintText}>
            Swipe up for next • Swipe down to skip • Swipe right to save
          </Text>
        </View>
      </View>
      )}

      
    {/* Onboarding tooltip */}
      {showOnboarding && <OnboardingTooltip onComplete={() => setShowOnboarding(false)} />}
    </SafeAreaView>
  );
}
