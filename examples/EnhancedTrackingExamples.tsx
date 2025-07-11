// Example implementations showing how to integrate enhanced tracking

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useEnhancedAnalytics } from '../contexts/EnhancedAnalyticsContext';
import { useNavigationTracking } from '../hooks/useNavigationTracking';

// Example 1: Enhanced Search Screen with comprehensive tracking
export const EnhancedSearchScreenExample = () => {
  const { trackSearch, trackPerformance, trackError } = useEnhancedAnalytics();
  useNavigationTracking('SearchScreen', true); // Auto-track navigation and performance
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    const searchStartTime = Date.now();
    setLoading(true);
    
    try {
      // Perform search
      const searchResults = await performSearch(query);
      setResults(searchResults);
      
      // Track search performance
      const searchTime = Date.now() - searchStartTime;
      await trackPerformance('search_time', searchTime, 'SearchScreen');
      
      // Track search with results
      await trackSearch(query, [], searchResults.length);
      
    } catch (error) {
      // Track search errors
      await trackError('search_error', error.message, 'SearchScreen');
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={() => handleSearch(searchQuery)}
        placeholder="Search articles..."
      />
      {/* Search results */}
    </View>
  );
};

// Example 2: Enhanced Settings Screen with change tracking
export const EnhancedSettingsScreenExample = () => {
  const { trackSettingsChange, trackNavigation } = useEnhancedAnalytics();
  useNavigationTracking('SettingsScreen');
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleDarkModeToggle = async (newValue: boolean) => {
    const oldValue = darkMode;
    setDarkMode(newValue);
    
    // Track the settings change
    await trackSettingsChange('dark_mode', oldValue, newValue);
  };

  const handleNotificationToggle = async (newValue: boolean) => {
    const oldValue = notifications;
    setNotifications(newValue);
    
    // Track the settings change
    await trackSettingsChange('notifications_enabled', oldValue, newValue);
  };

  const navigateToPrivacySettings = async () => {
    // Track navigation to privacy settings
    await trackNavigation('PrivacySettingsScreen', 'SettingsScreen');
    // Navigate to privacy settings
  };

  return (
    <View>
      <TouchableOpacity onPress={() => handleDarkModeToggle(!darkMode)}>
        <Text>Dark Mode: {darkMode ? 'On' : 'Off'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleNotificationToggle(!notifications)}>
        <Text>Notifications: {notifications ? 'On' : 'Off'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={navigateToPrivacySettings}>
        <Text>Privacy & Data Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example 3: Enhanced Article Card with detailed engagement tracking
export const EnhancedArticleCardExample = ({ article }) => {
  const { trackContentEngagement, trackArticleRead } = useEnhancedAnalytics();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [startTime] = useState(Date.now());

  // Track scroll depth
  const handleScroll = async (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPercentage = Math.round(
      (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100
    );
    
    if (scrollPercentage > scrollPosition && scrollPercentage % 25 === 0) {
      setScrollPosition(scrollPercentage);
      
      await trackContentEngagement('scroll_depth', {
        articleId: article.id,
        category: article.category,
        scrollPercentage,
        timeOfDay: new Date().getHours().toString(),
        dayOfWeek: new Date().getDay().toString(),
      });
    }
  };

  // Track reading time when component unmounts
  useEffect(() => {
    return () => {
      const readingTime = Math.floor((Date.now() - startTime) / 1000);
      if (readingTime > 5) { // Only track if user spent more than 5 seconds
        trackArticleRead(article.id, article.category, article.source_id, readingTime);
        trackContentEngagement('time_on_content', {
          articleId: article.id,
          category: article.category,
          timeSpent: readingTime,
          timeOfDay: new Date().getHours().toString(),
          dayOfWeek: new Date().getDay().toString(),
        });
      }
    };
  }, []);

  return (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={100}>
      <Text>{article.title}</Text>
      <Text>{article.content}</Text>
    </ScrollView>
  );
};

// Example 4: Enhanced Feed Screen with performance and error tracking
export const EnhancedFeedScreenExample = () => {
  const { trackPerformance, trackError, trackContentEngagement } = useEnhancedAnalytics();
  useNavigationTracking('FeedScreen', true);
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFeed = async () => {
    const loadStartTime = Date.now();
    setLoading(true);
    
    try {
      const feedData = await fetchFeedData();
      setArticles(feedData);
      
      // Track feed load performance
      const loadTime = Date.now() - loadStartTime;
      await trackPerformance('feed_load_time', loadTime, 'FeedScreen');
      
      // Track content engagement - feed loaded
      await trackContentEngagement('interaction_timing', {
        action: 'feed_loaded',
        articleCount: feedData.length,
        timeOfDay: new Date().getHours().toString(),
        dayOfWeek: new Date().getDay().toString(),
      });
      
    } catch (error) {
      // Track feed loading errors
      await trackError('feed_load_error', error.message, 'FeedScreen', error.stack);
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  return (
    <View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        articles.map(article => (
          <EnhancedArticleCardExample key={article.id} article={article} />
        ))
      )}
    </View>
  );
};

// Example 5: Gamification tracking example
export const GamificationExample = () => {
  const { trackGamification } = useEnhancedAnalytics();

  const handlePointsEarned = async (points: number, action: string) => {
    await trackGamification('points_earned', {
      points,
      action,
      totalPoints: getCurrentUserPoints() + points,
    });
  };

  const handleBadgeUnlocked = async (badgeId: string, badgeName: string) => {
    await trackGamification('badge_unlocked', {
      badgeId,
      badgeName,
      unlockedAt: new Date().toISOString(),
    });
  };

  const handleChallengeCompleted = async (challengeId: string, challengeName: string) => {
    await trackGamification('challenge_completed', {
      challengeId,
      challengeName,
      completedAt: new Date().toISOString(),
      timeToComplete: calculateTimeToComplete(challengeId),
    });
  };

  return (
    <View>
      <TouchableOpacity onPress={() => handlePointsEarned(10, 'article_read')}>
        <Text>Read Article (+10 points)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleBadgeUnlocked('first_save', 'First Save')}>
        <Text>Unlock Badge</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleChallengeCompleted('daily_reader', 'Daily Reader')}>
        <Text>Complete Challenge</Text>
      </TouchableOpacity>
    </View>
  );
};

// Helper functions (would be implemented elsewhere)
const performSearch = async (query: string) => {
  // Implement search logic
  return [];
};

const fetchFeedData = async () => {
  // Implement feed fetching logic
  return [];
};

const getCurrentUserPoints = () => {
  // Get current user points
  return 0;
};

const calculateTimeToComplete = (challengeId: string) => {
  // Calculate time to complete challenge
  return 0;
};