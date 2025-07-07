import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, Share2, Clock, ExternalLink } from 'lucide-react-native';
import { Article } from '../types/Article';
import { useTheme } from '../contexts/ThemeContext';
import { useFeed } from '../contexts/FeedContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ArticleCardProps {
  article: Article;
  onSave: () => void;
  onShare: () => void;
  isActive?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSave,
  onShare,
  isActive = true,
}) => {
  const { theme } = useTheme();
  const { state } = useFeed();
  const isArticleSaved = state.savedArticles.includes(article.id);

  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (isActive) {
      scale.value = withDelay(100, withSpring(1, { damping: 20, stiffness: 300 }));
      opacity.value = withDelay(100, withSpring(1));
      translateY.value = withDelay(100, withSpring(0));
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
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

  const getPlaceholderImage = () => {
    const categories = {
      technology: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg',
      business: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg',
      sports: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg',
      entertainment: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
      health: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg',
      science: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg',
      politics: 'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg',
      general: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg',
    };
    
    return categories[article.category as keyof typeof categories] || categories.general;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
        },
        android: {
          elevation: 12,
        },
        web: {
          boxShadow: `0 8px 32px ${theme.colors.shadow}20`,
        },
      }),
    },
    imageContainer: {
      height: SCREEN_HEIGHT * 0.35,
      position: 'relative',
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
      height: 100,
    },
    categoryBadge: {
      position: 'absolute',
      top: 16,
      left: 16,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    categoryText: {
      color: 'white',
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    content: {
      flex: 1,
      padding: 24,
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
      backgroundColor: theme.colors.primary,
      marginRight: 8,
    },
    sourceText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      lineHeight: 32,
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
    },
    actionButtonActive: {
      backgroundColor: theme.colors.primary + '20',
    },
    actionText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
      marginLeft: 8,
    },
    actionTextActive: {
      color: theme.colors.primary,
    },
    readMoreButton: {
      backgroundColor: theme.colors.primary,
    },
    readMoreText: {
      color: 'white',
    },
    readingTime: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    readingTimeText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: article.imageUrl || getPlaceholderImage() }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{article.category}</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.sourceContainer}>
            <View style={styles.sourceDot} />
            <Text style={styles.sourceText}>{article.source_id}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Clock size={12} color={theme.colors.textSecondary} />
            <Text style={styles.timeText}>{formatTimeAgo(article.published_at)}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={4}>
          {article.summary || article.description}
        </Text>

        {/* Reading Time */}
        <View style={styles.readingTime}>
          <Clock size={14} color={theme.colors.textSecondary} />
          <Text style={styles.readingTimeText}>
            {getReadingTime(article.description)} min read
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
              size={18}
              color={isArticleSaved ? theme.colors.primary : theme.colors.text}
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
            onPress={onShare}
            activeOpacity={0.7}
          >
            <Share2 size={18} color={theme.colors.text} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.readMoreButton]}
            activeOpacity={0.7}
          >
            <ExternalLink size={18} color="white" />
            <Text style={[styles.actionText, styles.readMoreText]}>Read</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default ArticleCard;