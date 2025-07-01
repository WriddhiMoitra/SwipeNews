import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Share, Alert } from 'react-native';
import { Article } from '../types/Article';
import { useFeed } from '../contexts/FeedContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import Icon from 'react-native-vector-icons/Feather';

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

  // Generate a placeholder image URL based on article title
  const getPlaceholderImage = () => {
    const seed = article.title.replace(/\s+/g, '+');
    return `https://picsum.photos/400/250?random=${article.id}`;
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
      elevation: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      margin: 0,
      height: height - 140,
      width: width - 32,
      flexDirection: 'column',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    sourceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sourceDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      marginRight: 8,
    },
    sourceText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 1,
    },
    timeText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    contentScrollView: {
      flex: 1,
    },
    imageContainer: {
      height: 200,
      marginHorizontal: 20,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    articleImage: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    contentContainer: {
      padding: 20,
      flex: 1,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 12,
      color: theme.colors.text,
      lineHeight: 28,
      letterSpacing: -0.5,
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 20,
      lineHeight: 24,
      fontWeight: '400',
    },
    categoryContainer: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginTop: 10,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 1,
    },
    actionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      minWidth: 80,
    },
    saveButton: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    shareButton: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    readMoreButton: {
      backgroundColor: theme.colors.primary,
    },
    actionIcon: {
      marginRight: 6,
    },
    actionText: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    savedText: {
      color: theme.colors.primary,
    },
    swipeIndicator: {
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
    },
    swipeBar: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.outline,
      borderRadius: 2,
      marginBottom: 6,
    },
    swipeText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={styles.cardContainer}>
      {/* Header with source and time */}
      <View style={styles.header}>
        <View style={styles.sourceContainer}>
          <View style={styles.sourceDot} />
          <Text style={styles.sourceText}>{article.source_id.toUpperCase()}</Text>
        </View>
        <Text style={styles.timeText}>{formatTimeAgo(article.published_at)}</Text>
      </View>

      {/* Main content area */}
      <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
        {/* Article Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getPlaceholderImage() }}
            style={styles.articleImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Article Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.description}>{article.description}</Text>
          
          {/* Category tag */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={() => onSave(article.id)}
          activeOpacity={0.7}
        >
          <Icon
            name={isArticleSaved ? 'bookmark' : 'bookmark'}
            size={20}
            color={isArticleSaved ? theme.colors.primary : theme.colors.text}
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, isArticleSaved && styles.savedText]}>
            {isArticleSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Icon name="share-2" size={20} color={theme.colors.text} style={styles.actionIcon} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.readMoreButton]}
          onPress={handleReadMore}
          activeOpacity={0.7}
        >
          <Icon name="external-link" size={20} color="#ffffff" style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: '#ffffff' }]}>Read More</Text>
        </TouchableOpacity>
      </View>

      {/* Swipe indicator */}
      <View style={styles.swipeIndicator}>
        <View style={styles.swipeBar} />
        <Text style={styles.swipeText}>Swipe up for next story</Text>
      </View>
    </View>
  );
};

export default NewsCard;
