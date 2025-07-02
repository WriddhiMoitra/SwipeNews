import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { Article } from '../types/Article';
import { fallbackTheme } from '../constants/theme';

export default function ArticleDetailScreen({ article, onBack }: { article: Article; onBack: () => void }) {
  const { theme } = useTheme();
  const activeTheme = theme || fallbackTheme;
  const styles = getStyles(activeTheme);
  const [showWebView, setShowWebView] = React.useState(false);

  useEffect(() => {
    // Any analytics tracking or other effects can be added here
  }, [article]);

  const handleOpenOriginal = () => {
    setShowWebView(true);
  };

  const handleCloseWebView = () => {
    setShowWebView(false);
  };

  if (showWebView) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: activeTheme.colors.border }]}>
          <TouchableOpacity onPress={handleCloseWebView} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
            <Text style={[styles.backText, { color: activeTheme.colors.text }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.colors.text }]}>{article.source_id}</Text>
        </View>
        <WebView
          source={{ uri: article.url }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[styles.loadingContainer, { backgroundColor: activeTheme.colors.background }]}>
              <Text style={[styles.loadingText, { color: activeTheme.colors.textSecondary }]}>Loading article...</Text>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}>  
      <View style={[styles.header, { borderBottomColor: activeTheme.colors.border }]}>  
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
          <Text style={[styles.backText, { color: activeTheme.colors.text }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: activeTheme.colors.text }]}>{article.source_id}</Text>
      </View>
      <ScrollView style={styles.contentContainer} contentContainerStyle={{paddingBottom: 32}}>
        {article.imageUrl && (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageGradient} />
          </View>
        )}
        <View style={styles.content}>
          <Text style={[styles.title, { color: activeTheme.colors.text }]}>{article.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{article.category?.toUpperCase() || 'NEWS'}</Text>
            <View style={styles.dot} />
            <Text style={styles.metaText}>{new Date(article.published_at).toLocaleDateString()}</Text>
          </View>
          {/* Prefer summary if present, fallback to description */}
          {article.summary ? (
            <Text style={[styles.description, { color: activeTheme.colors.textSecondary }]}>{article.summary}</Text>
          ) : (
            <Text style={[styles.description, { color: activeTheme.colors.textSecondary }]}>{article.description}</Text>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: activeTheme.colors.primary }]}
            onPress={handleOpenOriginal}
            activeOpacity={0.85}
          >
            <Icon name="external-link" size={18} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.buttonText}>Read Full Article</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    contentContainer: {
      flex: 1,
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
  });
}
