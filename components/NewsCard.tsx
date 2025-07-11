import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Share, Alert } from 'react-native';
import { Article } from '../types/Article';
import { useFeed } from '../contexts/FeedContext';
import { useTheme } from '../contexts/ThemeContext';
import { useEnhancedAnalytics } from '../contexts/EnhancedAnalyticsContext';
import { Bookmark, Share2, ExternalLink } from 'lucide-react-native';

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
  const { trackArticleShared, trackArticleSaved, trackArticleRead, trackContentEngagement } = useEnhancedAnalytics();
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
      await Share.share({ message: article.url });
      trackArticleShared(article.id, article.category, article.source_id);
      onShare(article.url);
    } catch (error) {
      Alert.alert('Error', 'Unable to share article.');
    }
  };

  const handleSave = () => {
    onSave(article.id);
    trackArticleSaved(article.id, article.category, article.source_id);
  };

  const handleReadMore = async () => {
    if (onReadMore) {
      const readingTime = getReadingTime(article.summary || article.description || '');
      await trackArticleRead(article.id, article.category, article.source_id, readingTime);
      
      // Track content engagement
      await trackContentEngagement('interaction_timing', {
        action: 'article_opened',
        articleId: article.id,
        category: article.category,
        timeOfDay: new Date().getHours().toString(),
        dayOfWeek: new Date().getDay().toString(),
      });
      
      onReadMore(article);
    }
  };

  // Only use real image if valid, else fallback
  const isValidImage = article.imageUrl && article.imageUrl.startsWith('http');
  const imageSource = isValidImage ? { uri: article.imageUrl } : { uri: getPlaceholderImage() };

  // Prefer AI summary, fallback to description
  const summary = article.summary && article.summary.length > 0 ? article.summary : article.description;

  const styles = StyleSheet.create({
    card: {
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
    image: {
      width: '100%',
      height: 200,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    meta: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    summaryContainer: {
      maxHeight: 60,
      overflow: 'hidden',
    },
    summary: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.colors.text,
      lineHeight: 20,
      marginBottom: 16,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
    },
    readMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
    },
    readMoreText: {
      color: 'white',
      fontFamily: 'Inter-Bold',
      marginRight: 4,
    },
  });

  return (
    <View style={styles.card}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>
          {formatTimeAgo(new Date(article.published_at))} · {getReadingTime(summary)} min read
        </Text>
        <ScrollView style={styles.summaryContainer}>
          <Text style={styles.summary}>{summary}</Text>
        </ScrollView>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Bookmark color={isArticleSaved ? theme.colors.primary : theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.readMoreButton} onPress={handleReadMore}>
            <Text style={styles.readMoreText}>Read</Text>
            <ExternalLink size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default NewsCard;