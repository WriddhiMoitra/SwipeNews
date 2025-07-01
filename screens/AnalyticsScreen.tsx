import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';

export default function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  // Fallback theme in case context is not available
  const fallbackTheme = {
    colors: {
      primary: '#E50914',
      text: '#1a1a1a',
      textSecondary: '#666666',
      background: '#ffffff',
      card: '#ffffff',
      border: '#e0e0e0',
      shadow: '#000000',
      surface: '#f5f5f5',
      surfaceVariant: '#f0f0f0',
      outline: '#cccccc',
      success: '#4CAF50',
      error: '#F44336',
    },
  };
  const activeTheme = theme || fallbackTheme;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Statistics</Text>
          <View style={[styles.statsCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
            <View style={styles.statItem}>
              <Icon name="book-open" size={24} color={activeTheme.colors.primary} style={styles.statIcon} />
              <View>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Articles Read</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Icon name="bookmark" size={24} color={activeTheme.colors.primary} style={styles.statIcon} />
              <View>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Articles Saved</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Icon name="share-2" size={24} color={activeTheme.colors.primary} style={styles.statIcon} />
              <View>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Articles Shared</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <View style={[styles.categoryCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
            <Text style={styles.noDataText}>No data available yet. Read more articles to see your top categories.</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Trends</Text>
          <View style={[styles.trendCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
            <Text style={styles.noDataText}>No data available yet. Your reading trends will appear here.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  statsCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#fff',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    marginRight: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  categoryCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#fff',
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#fff',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
