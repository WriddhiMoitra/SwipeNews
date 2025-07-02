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
      <ScrollView style={styles.contentContainer}>
        {article.imageUrl && (
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.content}>
          <Text style={[styles.title, { color: activeTheme.colors.text }]}>{article.title}</Text>
          {/* Prefer summary if present, fallback to description */}
          {article.summary ? (
            <Text style={[styles.description, { color: activeTheme.colors.textSecondary }]}>{article.summary}</Text>
          ) : (
            <Text style={[styles.description, { color: activeTheme.colors.textSecondary }]}>{article.description}</Text>
          )}
          <Text style={[styles.contentText, { color: activeTheme.colors.text }]}>Full content not available in preview. Click "Open Original" to read the full article.</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: activeTheme.colors.primary }]}
            onPress={handleOpenOriginal}
          >
            <Text style={styles.buttonText}>Open Original</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '500',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});
