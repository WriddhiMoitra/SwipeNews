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
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, Share2, Clock, ExternalLink, Eye } from 'lucide-react-native';
import { Article } from '../types/Article';
import { useTheme } from '../contexts/ThemeContext';
import { useFeed } from '../contexts/FeedContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.78;
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface ArticleCardProps {
  article: Article;
  onSave: () => void;
  onShare: () => void;
  isActive?: boolean;
  index?: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSave,
  onShare,
  isActive = true,
  index = 0,
}) => {
  const { theme } = useTheme();
  const { state } = useFeed();
  const isArticleSaved = state.savedArticles.includes(article.id);

  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const imageScale = useSharedValue(1.1);

  useEffect(() => {
    if (isActive) {
      const delay = index * 100;
      
      scale.value = withDelay(delay, withSpring(1, { 
        damping: 20, 
        stiffness: 300,
        mass: 0.8
      }));
      
      opacity.value = withDelay(delay, withSpring(1, {
        damping: 25,
        stiffness: 400
      }));
      
      translateY.value = withDelay(delay, withSpring(0, {
        damping: 20,
        stiffness: 300
      }));

      imageScale.value = withDelay(delay + 200, withSpring(1, {
        damping: 25,
        stiffness: 200
      }));
    }
  }, [isActive, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
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
      technology: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800',
      business: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=800',
      sports: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800',
      entertainment: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
      health: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
      science: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800',
      politics: 'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800',
      general: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800',
    };
    
    return categories[article.category as keyof typeof categories] || categories.general;
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
      borderRadius: 24,
      overflow: 'hidden',
      marginHorizontal: 16,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
        },
        android: {
          elevation: 16,
        },
        web: {
          boxShadow: `0 12px 40px ${theme.colors.shadow}15`,
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
    categoryBadge: {
      position: 'absolute',
      top: 20,
      left: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
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
      backdropFilter: 'blur(10px)',
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
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      lineHeight: 30,
      marginBottom: 12,
      letterSpacing: -0.3,
    },
    description: {
      fontSize: 15,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: 24,
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
      backdropFilter: 'blur(10px)',
    },
    engagementText: {
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      color: theme.colors.text,
      marginLeft: 4,
    },
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Animated.View style={[{ width: '100%', height: '100%' }, imageAnimatedStyle]}>
          <Image
            source={{ uri: article.imageUrl || getPlaceholderImage() }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageOverlay}
        />
        
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.category) + '90' }]}>
          <Text style={styles.categoryText}>{article.category}</Text>
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
              <View style={[styles.sourceDot, { backgroundColor: getCategoryColor(article.category) }]} />
              <Text style={styles.sourceText}>{article.source_id}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Clock size={10} color={theme.colors.textSecondary} />
              <Text style={styles.timeText}>{formatTimeAgo(article.published_at)}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={3}>
            {article.title}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={3}>
            {article.summary || article.description}
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
            <Share2 size={16} color={theme.colors.text} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.readMoreButton]}
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