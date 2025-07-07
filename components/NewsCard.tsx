import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Share, Alert } from 'react-native';
import { Article } from '../types/Article';
import { useFeed } from '../contexts/FeedContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { Bookmark, Share2, ExternalLink, Clock, Eye } from 'lucide-react-native';

interface NewsCardProps {
  article: Article;
  onSave: (articleId: string) => void;
  onShare: (articleUrl: string) => void;
  onReadMore?: (article: Article) => void;
}

const { width, height } = Dimensions.get('window');

const NewsCard: React.FC<NewsCardProps> = ({ article, onSave, onShare, onReadMore }) => {
  const { state } = useFeed();
  const { theme } = useTheme();
  const { trackArticleShared } = useAnalytics();
  const isArticleSaved = state.savedArticles.includes(article.id);
  
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

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${article.title}\n\n${article.description}\n\nRead more: ${article.url}`,
        url: article.url,
        title: article.title,
      });

      if (result.action === Share.sharedAction) {
        await trackArticleShared(article.id, article.category, article.source_id);
        onShare(article.url);
      }
    } catch (error) {
      console.error('Error sharing article:', error);
      Alert.alert('Error', 'Failed to share article');
    }
  };

  const handleReadMore = () => {
    if (onReadMore) {
      onReadMore(article);
    }
  };

  const styles = StyleSheet.create({
    cardContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      overflow: 'hidden',
      marginHorizontal: 16,
      marginVertical: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    imageContainer: {
      height: 200,
      position: 'relative',
      overflow: 'hidden',
    },
    articleImage: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    categoryBadge: {
      position: 'absolute',
      top: 16,
      left: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    categoryText: {
      color: 'white',
      fontSize: 11,
      fontFamily: 'Inter-SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    readingTimeBadge: {
      position: 'absolute',
      top: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    readingTimeText: {
      color: 'white',
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      marginLeft: 4,
    },
    engagementBadge: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    engagementText: {
      color: theme.colors.text,
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      marginLeft: 4,
    },
    contentContainer: {
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sourceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sourceDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 8,
    },
    sourceText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: theme.colors.primary,
    },
    timeText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.colors.textSecondary,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      lineHeight: 24,
      marginBottom: 8,
      letterSpacing: -0.2,
    },
    description: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    actionContainer: {
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
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      minWidth: 70,
      justifyContent: 'center',
    },
    actionButtonActive: {
      backgroundColor: theme.colors.primary + '15',
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    actionText: {
      fontSize: 12,
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
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    readMoreText: {
      color: 'white',
      fontFamily: 'Inter-Bold',
    },
  });

  return (
    <View style={styles.cardContainer}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: article.imageUrl || getPlaceholderImage() }}
          style={styles.articleImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.category) + '90' }]}>
          <Text style={styles.categoryText}>{article.category}</Text>
        </View>
        
        <View style={styles.readingTimeBadge}>
          <Clock size={10} color="white" />
          <Text style={styles.readingTimeText}>
            {getReadingTime(article.description)} min
          </Text>
        </View>

        <View style={styles.engagementBadge}>
          <Eye size={10} color={theme.colors.text} />
          <Text style={styles.engagementText}>
            {Math.floor(Math.random() * 1000) + 100}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.sourceContainer}>
            <View style={[styles.sourceDot, { backgroundColor: getCategoryColor(article.category) }]} />
            <Text style={styles.sourceText}>{article.source_id}</Text>
          </View>
          <Text style={styles.timeText}>{formatTimeAgo(article.published_at)}</Text>
        </View>

        {/* Title and Description */}
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {article.summary || article.description}
        </Text>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isArticleSaved && styles.actionButtonActive,
            ]}
            onPress={() => onSave(article.id)}
            activeOpacity={0.7}
          >
            <Bookmark
              size={14}
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
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Share2 size={14} color={theme.colors.text} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.readMoreButton]}
            onPress={handleReadMore}
            activeOpacity={0.8}
          >
            <ExternalLink size={14} color="white" />
            <Text style={[styles.actionText, styles.readMoreText]}>Read</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default NewsCard;