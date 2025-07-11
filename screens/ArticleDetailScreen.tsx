import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Animated, ActivityIndicator, Share, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useEnhancedAnalytics } from '../contexts/EnhancedAnalyticsContext';
import { useNavigationTracking } from '../hooks/useNavigationTracking';
import { fallbackTheme } from '../constants/theme';
import { Article } from '../types/Article';
import { ExternalLink, ArrowLeft } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { Download, Bookmark, Share2, Clock, RotateCcw } from 'lucide-react-native';
import { ProgressTrackingService } from '../services/progressTrackingService';
import { GamificationService } from '../services/gamificationService';
import { OfflineDownloadService } from '../services/offlineDownloadService';
import { useAuth } from '../contexts/AuthContext';
import * as Progress from 'react-native-progress';

// Helper for category color/icon
const CATEGORY_COLORS: Record<string, string> = {
  technology: '#3B82F6',
  business: '#10B981',
  sports: '#F59E0B',
  entertainment: '#EF4444',
  health: '#06B6D4',
  science: '#8B5CF6',
  politics: '#DC2626',
  general: '#6B7280',
};

export default function ArticleDetailScreen({ article, onBack }: { article: Article; onBack: () => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { trackTimeSpent, trackArticleRead, trackArticleShared, trackArticleSaved, trackContentEngagement } = useEnhancedAnalytics();
  
  const progressService = ProgressTrackingService.getInstance();
  const gamificationService = GamificationService.getInstance();
  const offlineService = OfflineDownloadService.getInstance();
  
  // Add navigation tracking
  useNavigationTracking('ArticleDetailScreen', true);
  const activeTheme = theme || fallbackTheme;
  const styles = getStyles(activeTheme);
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());
  const [webViewStartTime, setWebViewStartTime] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isOffline, setIsOffline] = useState(article.offline || false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [canResume, setCanResume] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    startTime.current = Date.now();
    
    // Track article view with enhanced analytics
    trackContentEngagement('view', article.id, {
      category: article.category,
      source: article.source_id,
      timeOfDay: new Date().getHours().toString(),
      dayOfWeek: new Date().getDay().toString(),
    });
    
    return () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      if (timeSpent > 5) { // Only track meaningful reading time
        trackTimeSpent(article.id, timeSpent);
        trackArticleRead(article.id, article.category, article.source_id, timeSpent);
      }
    };
  }, [article, trackContentEngagement, trackTimeSpent, trackArticleRead]);

  // Reading progress resume (store last scroll position per article)
  const [initialScroll, setInitialScroll] = useState<number>(0);
  useEffect(() => {
    const key = `article-scroll-${article.id}`;
    const saved = typeof window !== 'undefined' ? window.localStorage?.getItem(key) : null;
    if (saved) setInitialScroll(Number(saved));
  }, [article.id]);
  // Reading progress tracker
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const total = contentSize.height - layoutMeasurement.height;
    if (total > 0) {
      setProgress(Math.min(1, contentOffset.y / total));
    } else {
      setProgress(0);
    }
    // Save scroll position for resume
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(`article-scroll-${article.id}`, String(contentOffset.y));
    }
  };

  // Share functionality
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n${article.url}`,
        url: article.url,
        title: article.title,
      });
      await trackArticleShared(article.id, article.category, article.source_id);
    } catch (e) {}
  };

  // When the article is saved, automatically download for offline
  useEffect(() => {
    if (isOffline === false && article && user) {
      OfflineDownloadService.getInstance().downloadArticle(article);
      setIsOffline(true);
    }
  }, [article, user, isOffline]);

  const handleOpenOriginal = () => {
    setWebViewStartTime(Date.now());
    setShowWebView(true);
  };

  const handleCloseWebView = () => {
    setShowWebView(false);
    if (webViewStartTime) {
      const timeSpent = Math.round((Date.now() - webViewStartTime) / 1000);
      trackTimeSpent(article.id, timeSpent);
      setWebViewStartTime(null);
    }
  };

  // Only use real image if valid, else fallback to no image
  const isValidImage = article.imageUrl && article.imageUrl.startsWith('http');
  const summary = article.summary && article.summary.trim().length > 0 ? article.summary : null;
  const categoryColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general;

  if (showWebView) {
    return (
      <SafeAreaView style={styles.container}>
        <FloatingBackButton onPress={handleCloseWebView} activeTheme={activeTheme} styles={styles} />
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBg} />
          <Animated.View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: categoryColor }]} />
        </View>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Original Article</Text>
        </View>
        <WebView
          source={{ uri: article.url }}
          style={styles.webView}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}><ActivityIndicator size="large" color={activeTheme.colors.primary} /></View>
          )}
          onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
        />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}>  
      <FloatingBackButton onPress={onBack} activeTheme={activeTheme} styles={styles} />
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }, { scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] }}>
        {/* Reading progress bar */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBg} />
          <Animated.View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: categoryColor }]} />
        </View>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Details</Text>
        </View>
        <ScrollView
          ref={scrollRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentOffset={{ y: initialScroll, x: 0 }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {isValidImage && (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: article.imageUrl }} style={styles.image} resizeMode="cover" />
              <View style={styles.imageGradient} />
              {/* Animated, polished category badge */}
              <Animated.View style={[styles.categoryBadge, { backgroundColor: categoryColor + 'F2', transform: [{ scale: fadeAnim }] }]}> 
                <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
              </Animated.View>
            </View>
          )}
          <View style={styles.content}>
            <Text style={styles.title}>{article.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{article.source_id}</Text>
              <View style={styles.dot} />
              <Text style={styles.metaText}>{new Date(article.published_at).toLocaleDateString()}</Text>
            </View>
            {/* Improved summary section */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>AI Summary</Text>
              <Text style={styles.description}>
                {summary ? summary : 'No AI summary available for this article.'}
              </Text>
            </View>
            {/* Action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share2 color={activeTheme.colors.primary} size={18} />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleOpenOriginal}>
                <ExternalLink color={activeTheme.colors.primary} size={18} />
                <Text style={styles.actionButtonText}>Read Original</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// Animated, floating back button (always visible)
const FloatingBackButton = ({ onPress, activeTheme, styles }: { onPress: () => void; activeTheme: typeof fallbackTheme; styles: any }) => (
  <TouchableOpacity style={styles.floatingBackButton} onPress={onPress} activeOpacity={0.8}>
    <ArrowLeft color={activeTheme.colors.text} size={26} />
  </TouchableOpacity>
);

function getStyles(activeTheme: typeof fallbackTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: activeTheme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      backgroundColor: activeTheme.colors.card,
      shadowColor: activeTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      borderBottomColor: activeTheme.colors.border,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 6,
      borderRadius: 8,
      backgroundColor: activeTheme.colors.surface,
    },
    backText: {
      fontSize: 16,
      marginLeft: 8,
      fontWeight: '500',
      color: activeTheme.colors.text,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: activeTheme.colors.text,
    },
    imageWrapper: {
      width: '100%',
      height: 220,
      position: 'relative',
      marginBottom: 0,
    },
    image: {
      width: '100%',
      height: '100%',
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
    },
    imageGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 60,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      backgroundColor: activeTheme.colors.shadow + '1F', // 12% opacity
    },
    content: {
      padding: 20,
      backgroundColor: activeTheme.colors.card,
      borderRadius: 18,
      marginHorizontal: 12,
      marginTop: -30,
      shadowColor: activeTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 8,
      color: activeTheme.colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    metaText: {
      fontSize: 13,
      color: activeTheme.colors.textSecondary,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: activeTheme.colors.outline,
      marginHorizontal: 8,
    },
    description: {
      fontSize: 16,
      marginBottom: 18,
      fontWeight: '500',
      color: activeTheme.colors.textSecondary,
      lineHeight: 24,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 8,
      marginTop: 8,
      backgroundColor: activeTheme.colors.primary,
      shadowColor: activeTheme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 2,
    },
    buttonText: {
      color: activeTheme.colors.background,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 4,
    },
    webView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: activeTheme.colors.background,
    },
    loadingText: {
      fontSize: 16,
      color: activeTheme.colors.textSecondary,
    },
    progressBarWrapper: {
      height: 4,
      width: '100%',
      backgroundColor: 'transparent',
      marginBottom: 0,
      position: 'relative',
      zIndex: 10,
    },
    progressBarBg: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: activeTheme.colors.surface,
      borderRadius: 2,
    },
    progressBarFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: activeTheme.colors.primary,
      borderRadius: 2,
      height: 4,
    },
    categoryBadge: {
      position: 'absolute',
      top: 18,
      left: 18,
      backgroundColor: activeTheme.colors.primary + 'E6',
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 6,
      shadowColor: activeTheme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 2,
      zIndex: 20,
      alignSelf: 'flex-start',
      opacity: 0.95,
    },
    categoryText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 13,
      letterSpacing: 1,
    },
    summarySection: {
      backgroundColor: activeTheme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 18,
      marginTop: 8,
      shadowColor: activeTheme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
    },
    summaryTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: activeTheme.colors.primary,
      marginBottom: 6,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      gap: 10,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: activeTheme.colors.surface,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      shadowColor: activeTheme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
      color: activeTheme.colors.textSecondary,
    },
    floatingBackButton: {
      position: 'absolute',
      top: 18,
      left: 18,
      zIndex: 100,
      backgroundColor: activeTheme.colors.card + 'F2',
      borderRadius: 24,
      padding: 8,
      shadowColor: activeTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 4,
    },
  });
}
