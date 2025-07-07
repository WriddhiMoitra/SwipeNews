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
import { useFeed } from '../../contexts/FeedContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useAuth } from '../../contexts/AuthContext';
import ArticleCard from '../../components/ArticleCard';
import LoadingShimmer from '../../components/LoadingShimmer';
import OnboardingTooltip from '../../components/OnboardingTooltip';
import { Article } from '../../types/Article';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.78;
const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 800;

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
  const nextCardScale = useSharedValue(0.95);
  const nextCardOpacity = useSharedValue(0.7);
  const headerOpacity = useSharedValue(1);
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
    
    // Animate header when changing articles
    headerOpacity.value = withSequence(
      withTiming(0.7, { duration: 200 }),
      withTiming(1, { duration: 300 })
    );
  }, [currentIndex]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
    setCurrentIndex(0);
    translateY.value = 0;
    scale.value = 1;
    opacity.value = 1;
  };

  const handleSwipeUp = async () => {
    if (currentIndex < state.articles.length - 1) {
      const article = state.articles[currentIndex];
      toggleSaveArticle(article.id);
      await trackSwipeAction('up', article.id, article.category);
      
      // Animate to next card
      translateY.value = withSpring(-SCREEN_HEIGHT, {
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
      translateY.value = withSpring(SCREEN_HEIGHT, {
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

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
      
      // Enhanced visual feedback
      const progress = Math.abs(event.translationY) / SWIPE_THRESHOLD;
      const clampedProgress = Math.min(progress, 1);
      
      scale.value = interpolate(
        clampedProgress,
        [0, 1],
        [1, 0.92],
        Extrapolate.CLAMP
      );
      
      opacity.value = interpolate(
        clampedProgress,
        [0, 1],
        [1, 0.8],
        Extrapolate.CLAMP
      );

      // Next card preview
      nextCardScale.value = interpolate(
        clampedProgress,
        [0, 1],
        [0.95, 1],
        Extrapolate.CLAMP
      );

      nextCardOpacity.value = interpolate(
        clampedProgress,
        [0, 1],
        [0.7, 1],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      const shouldSwipeUp = event.translationY < -SWIPE_THRESHOLD && event.velocityY < -VELOCITY_THRESHOLD;
      const shouldSwipeDown = event.translationY > SWIPE_THRESHOLD && event.velocityY > VELOCITY_THRESHOLD;
      
      if (shouldSwipeUp) {
        runOnJS(handleSwipeUp)();
      } else if (shouldSwipeDown) {
        runOnJS(handleSwipeDown)();
      } else {
        // Return to original position with spring animation
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
        opacity.value = withSpring(1, { damping: 20, stiffness: 300 });
        nextCardScale.value = withSpring(0.95, { damping: 20, stiffness: 300 });
        nextCardOpacity.value = withSpring(0.7, { damping: 20, stiffness: 300 });
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
    transform: [{ scale: nextCardScale.value }],
    opacity: nextCardOpacity.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingHorizontal: 24,
      paddingBottom: 24,
      backgroundColor: theme.colors.background,
    },
    headerTitle: {
      fontSize: 34,
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      marginBottom: 8,
      letterSpacing: -1,
    },
    headerSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      lineHeight: 22,
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

  if (state.isLoading && state.articles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text style={styles.headerTitle}>SwipeNews</Text>
          <Text style={styles.headerSubtitle}>Loading your personalized feed...</Text>
        </Animated.View>
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
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Text style={styles.headerTitle}>SwipeNews</Text>
        <Text style={styles.headerSubtitle}>
          Discover stories that matter to you
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {state.articles.length}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.cardContainer}>
        {/* Next card (behind) */}
        {nextArticle && (
          <Animated.View style={[styles.card, nextCardStyle]}>
            <ArticleCard
              article={nextArticle}
              onSave={() => toggleSaveArticle(nextArticle.id)}
              onShare={() => {}}
              isActive={false}
              index={1}
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
                index={0}
              />
            </Animated.View>
          </GestureDetector>
        )}
      </View>

      {/* Swipe hints */}
      <View style={styles.swipeHint}>
        <View style={styles.swipeHintContainer}>
          <Text style={styles.swipeHintText}>
            Swipe up to save • Swipe down for next
          </Text>
        </View>
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