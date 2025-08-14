import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Animated,
{
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, Share2, Clock, ExternalLink, Eye, Star, Sparkles, Download, Wifi, WifiOff } from 'lucide-react-native';
import { Article } from '../types/Article';
import { useTheme } from '../contexts/ThemeContext';
import { useFeed } from '../contexts/FeedContext';
import { usePersonalization } from '../contexts/PersonalizationContext';
import { useOffline } from '../contexts/OfflineContext';
import { OfflineDownloadService } from '../services/offlineDownloadService';
import { GamificationService } from '../services/gamificationService';
import { ProgressTrackingService } from '../services/progressTrackingService';
import { useAuth } from '../contexts/AuthContext';
import { Animated as RNAnimated } from 'react-native';
import * as Sharing from 'expo-sharing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.85; // Reduce from 0.82 to 0.74 to avoid tab bar overlap
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_BORDER_RADIUS = 28;

interface ArticleCardProps {
  article: Article;
  onSave: () => void;
  onShare: () => void;
  isActive?: boolean;
  index?: number;
  onReadMore?: () => void;
  onDownload?: () => void;
}

/**
 * ArticleCard displays a single news article in a visually rich, card-based format.
 *
 * Features:
 * - Large, immersive card (82% of screen height)
 * - 28px border radius, deep shadows
 * - Category color coding, reading time, engagement metrics
 * - Animated entrance, smooth transitions
 * - Accessibility and semantic structure
 *
 * @param {ArticleCardProps} props
 */
const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSave,
  onShare,
  isActive = true,
  index = 0,
  onReadMore,
}) => {
  const { theme } = useTheme();
  const { state } = useFeed();
  const { getUserStats } = usePersonalization();
  const { isOffline } = useOffline();
  const { user } = useAuth();
  
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  const offlineService = OfflineDownloadService.getInstance();
  const gamificationService = GamificationService.getInstance();
  const progressService = ProgressTrackingService.getInstance();
  const [categoryAnim] = useState(new RNAnimated.Value(1));
  const [userStats, setUserStats] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const stats = await getUserStats();
      setUserStats(stats);
    })();
  }, []);

  // Check if article is downloaded
  useEffect(() => {
    const checkDownloadStatus = async () => {
      const downloaded = await offlineService.isArticleDownloaded(article.id);
      setIsDownloaded(downloaded);
    };
    checkDownloadStatus();
  }, [article.id]);

  // When the article is saved, automatically download for offline
  useEffect(() => {
    if (state.savedArticles.includes(article.id) && !isDownloaded) {
      offlineService.downloadArticle(article).then(() => setIsDownloaded(true));
    }
  }, [state.savedArticles, isDownloaded, article]);

  /**
   * Handles downloading an article for offline reading and awards points.
   */
  const handleDownload = async () => {
    if (!user || isDownloading || isDownloaded) return;
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      await offlineService.downloadArticle(article);
      clearInterval(progressInterval);
      setDownloadProgress(100);
      setIsDownloaded(true);
      setIsDownloading(false);
      // Award points for downloading (use user.id)
      if (user && user.id) {
        await gamificationService.awardPoints(user.id, 10, 'Downloaded article for offline reading');
      }
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  /**
   * Handles sharing an article and awards points/challenge progress.
   */
  const handleEnhancedShare = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(article.url, {
          mimeType: 'text/plain',
          dialogTitle: `Share: ${article.title}`,
        });
      } else {
        onShare();
      }
      if (user && user.id) {
        await gamificationService.awardPoints(user.id, 15, 'Shared article');
        await gamificationService.updateChallengeProgress(user.id, 'sharing_challenge', 1);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };
  const isFavoriteCategory = userStats?.favoriteCategories?.includes(article.category);
  const isRecommendedCategory = userStats?.recommendedCategories?.includes(article.category);
  const isArticleSaved = state.savedArticles.includes(article.id);

  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const imageScale = useSharedValue(1.1);

  useEffect(() => {
    if (isActive) {
      const delay = index * 100;

      scale.value = withDelay(
        delay,
        withSpring(1, {
          damping: 20,
          stiffness: 300,
          mass: 0.8,
        })
      );

      opacity.value = withDelay(
        delay,
        withSpring(1, {
          damping: 25,
          stiffness: 400,
        })
      );

      translateY.value = withDelay(
        delay,
        withSpring(0, {
          damping: 20,
          stiffness: 300,
        })
      );

      imageScale.value = withDelay(
        delay + 200,
        withSpring(1, {
          damping: 25,
          stiffness: 200,
        })
      );
    }
  }, [isActive, index]);

  const animatedStyle = useAnimatedStyle(() => {
    // Clamp translateY to avoid card going off screen
    let clampedTranslateY = Math.max(
      -CARD_HEIGHT * 0.6,
      Math.min(translateY.value, CARD_HEIGHT * 0.6)
    );
    return {
      transform: [{ scale: scale.value }, { translateY: clampedTranslateY }],
      opacity: opacity.value,
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const handleCategoryPress = () => {
    RNAnimated.sequence([
      RNAnimated.spring(categoryAnim, { toValue: 1.12, useNativeDriver: true }),
      RNAnimated.spring(categoryAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const getArticleImage = () => {
    if (
      article.imageUrl &&
      article.imageUrl.trim() !== '' &&
      article.imageUrl.startsWith('http')
    ) {
      return article.imageUrl;
    }
    return 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: '#3B82F6',
      business: '#10B981',
      sports: '#F59E0B',
      entertainment: '#EF4444',
      health: '#06B6D4',
      science: '#8B5CF6',
      politics: '#DC2626',
      general: '#6B7280',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const styles = StyleSheet.create({
    container: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      backgroundColor: theme.colors.card,
      borderRadius: CARD_BORDER_RADIUS,
      overflow: 'hidden',
      marginHorizontal: 16,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.22,
          shadowRadius: 32,
        },
        android: {
          elevation: 24,
        },
        web: {
          boxShadow: `0 16px 48px ${theme.colors.shadow}22`,
        },
      }),
    },
    imageContainer: {
      height: CARD_HEIGHT * 0.45,
      position: 'relative',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
    },
    categoryBadgeWrapper: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 10,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      elevation: 8,
    },
    categoryText: {
      color: 'white',
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    readingTimeBadge: {
      position: 'absolute',
      top: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    readingTimeText: {
      color: 'white',
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      marginLeft: 4,
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sourceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    sourceDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 10,
    },
    sourceText: {
      fontSize: 13,
      fontFamily: 'Inter-SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: theme.colors.primary,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    timeText: {
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    title: {
      fontSize: 26, // Larger, more readable
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      lineHeight: 34,
      marginBottom: 14,
      letterSpacing: -0.3,
      textAlign: 'left',
    },
    description: {
      fontSize: 17,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      lineHeight: 25,
      marginBottom: 28,
      textAlign: 'left',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      minWidth: 80,
      justifyContent: 'center',
    },
    actionButtonActive: {
      backgroundColor: theme.colors.primary + '15',
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    actionText: {
      fontSize: 13,
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
      marginLeft: 6,
    },
    actionTextActive: {
      color: theme.colors.primary,
    },
    readMoreButton: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    readMoreText: {
      color: 'white',
      fontFamily: 'Inter-Bold',
    },
    engagementIndicator: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    engagementText: {
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      color: theme.colors.text,
      marginLeft: 4,
    },
  });

  // Add accessibilityLabel to main container
  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      accessible
      accessibilityLabel={`News card: ${article.title}`}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Animated.View
          style={[{ width: '100%', height: '100%' }, imageAnimatedStyle]}
        >
          <Image
            source={{ uri: getArticleImage() }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageOverlay}
        />

        <View
          style={styles.categoryBadgeWrapper}
        >
          <RNAnimated.View
            style={[
              styles.categoryBadge,
              {
                backgroundColor: getCategoryColor(article.category) + (isFavoriteCategory ? 'FF' : 'E6'),
                shadowColor: getCategoryColor(article.category),
                shadowOpacity: isRecommendedCategory ? 0.5 : 0.18,
                transform: [{ scale: categoryAnim }],
                borderWidth: isFavoriteCategory ? 2 : 0,
                borderColor: isFavoriteCategory ? theme.colors.primary : 'transparent',
              },
            ]}
          >
            <TouchableOpacity onPress={handleCategoryPress} activeOpacity={0.7}>
              <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
              {isFavoriteCategory && <Star color={theme.colors.primary} size={12} style={{ marginLeft: 4 }} />}
              {isRecommendedCategory && <Sparkles color={theme.colors.primary} size={12} style={{ marginLeft: 4 }} />}
            </TouchableOpacity>
          </RNAnimated.View>
        </View>

        <View style={styles.readingTimeBadge}>
          <Clock size={12} color="white" />
          <Text style={styles.readingTimeText}>
            {getReadingTime(article.description)} min
          </Text>
        </View>

        <View style={styles.engagementIndicator}>
          <Eye size={12} color={theme.colors.text} />
          <Text style={styles.engagementText}>
            {Math.floor(Math.random() * 1000) + 100}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.sourceContainer}>
              <View
                style={[
                  styles.sourceDot,
                  { backgroundColor: getCategoryColor(article.category) },
                ]}
              />
              <Text style={styles.sourceText}>{article.source_id}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Clock size={10} color={theme.colors.textSecondary} />
              <Text style={styles.timeText}>
                {formatTimeAgo(article.published_at)}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={styles.title}
            numberOfLines={3}
            accessibilityRole="header"
          >
            {article.title}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={3}>
            {article.summary && article.summary.trim() !== ''
              ? article.summary
              : article.description && article.description.trim() !== ''
                ? article.description
                : 'No description available.'}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isArticleSaved && styles.actionButtonActive,
            ]}
            onPress={onSave}
            activeOpacity={0.7}
          >
            <Bookmark
              size={16}
              color={
                isArticleSaved ? theme.colors.primary : theme.colors.text
              }
              fill={isArticleSaved ? theme.colors.primary : 'none'}
            />
            <Text
              style={[
                styles.actionText,
                isArticleSaved && styles.actionTextActive,
              ]}
            >
              {isArticleSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEnhancedShare}
            activeOpacity={0.7}
          >
            <Share2 size={16} color={theme.colors.text} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, {
              backgroundColor: isDownloaded ? '#10B981' : isDownloading ? '#F59E0B' : 'rgba(255,255,255,0.1)',
            }]}
            onPress={handleDownload}
            disabled={isDownloading || isDownloaded}
            activeOpacity={0.7}
          >
            {isDownloaded ? (
              <WifiOff size={16} color="white" />
            ) : isDownloading ? (
              <Download size={16} color="white" />
            ) : (
              <Download size={16} color={theme.colors.text} />
            )}
            <Text style={[styles.actionText, { color: isDownloaded || isDownloading ? 'white' : theme.colors.text }]}>
              {isDownloaded ? 'Offline' : isDownloading ? `${downloadProgress}%` : 'Download'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.readMoreButton]}
            onPress={onReadMore}
            activeOpacity={0.8}
          >
            <ExternalLink size={16} color="white" />
            <Text style={[styles.actionText, styles.readMoreText]}>Read</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default ArticleCard;
