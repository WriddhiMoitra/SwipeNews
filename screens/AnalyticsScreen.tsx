import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { fallbackTheme } from '../constants/theme';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { usePersonalization } from '../contexts/PersonalizationContext';

export default function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const activeTheme = theme || fallbackTheme;
  const { getUserStats } = usePersonalization();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await getUserStats();
        setStats(s);
      } catch (e) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const styles = StyleSheet.create({
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
      borderBottomColor: activeTheme.colors.border,
      backgroundColor: activeTheme.colors.card,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
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
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      color: activeTheme.colors.text,
    },
    statsCard: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 16,
      backgroundColor: activeTheme.colors.card,
      borderColor: activeTheme.colors.border,
      marginBottom: 10,
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
      color: activeTheme.colors.text,
    },
    statLabel: {
      fontSize: 14,
      color: activeTheme.colors.textSecondary,
    },
    categoryCard: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 16,
      backgroundColor: activeTheme.colors.card,
      borderColor: activeTheme.colors.border,
      minHeight: 100,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    categoryList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
    },
    categoryChip: {
      backgroundColor: activeTheme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      marginRight: 8,
      marginBottom: 8,
    },
    categoryText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    trendCard: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 16,
      backgroundColor: activeTheme.colors.card,
      borderColor: activeTheme.colors.border,
      minHeight: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noDataText: {
      fontSize: 16,
      color: activeTheme.colors.textSecondary,
      textAlign: 'center',
    },
    swipeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    swipeLabel: {
      fontSize: 14,
      color: activeTheme.colors.textSecondary,
      marginRight: 8,
    },
    swipeValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: activeTheme.colors.primary,
      marginRight: 16,
    },
  });

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
        {loading ? (
          <ActivityIndicator size="large" color={activeTheme.colors.primary} style={{ marginTop: 40 }} />
        ) : stats ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reading Statistics</Text>
              <View style={styles.statsCard}>
                <View style={styles.statItem}>
                  <Icon name="book-open" size={24} color={activeTheme.colors.primary} style={styles.statIcon} />
                  <View>
                    <Text style={styles.statValue}>{stats.totalArticlesRead || 0}</Text>
                    <Text style={styles.statLabel}>Articles Read</Text>
                  </View>
                </View>
                <View style={styles.statItem}>
                  <Icon name="bookmark" size={24} color={activeTheme.colors.primary} style={styles.statIcon} />
                  <View>
                    <Text style={styles.statValue}>{stats.totalArticlesSaved || 0}</Text>
                    <Text style={styles.statLabel}>Articles Saved</Text>
                  </View>
                </View>
                <View style={styles.statItem}>
                  <Icon name="share-2" size={24} color={activeTheme.colors.primary} style={styles.statIcon} />
                  <View>
                    <Text style={styles.statValue}>{stats.totalArticlesShared || 0}</Text>
                    <Text style={styles.statLabel}>Articles Shared</Text>
                  </View>
                </View>
                <View style={styles.statItem}>
                  <Icon name="clock" size={24} color={activeTheme.colors.primary} style={styles.statIcon} />
                  <View>
                    <Text style={styles.statValue}>{stats.averageReadingTime || 0} min</Text>
                    <Text style={styles.statLabel}>Avg. Reading Time</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Categories</Text>
              <View style={styles.categoryCard}>
                {stats.topCategories && stats.topCategories.length > 0 ? (
                  <View style={styles.categoryList}>
                    {stats.topCategories.map((cat: string, idx: number) => (
                      <View key={cat} style={styles.categoryChip}>
                        <Text style={styles.categoryText}>{cat}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noDataText}>No data available yet. Read more articles to see your top categories.</Text>
                )}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reading Trends</Text>
              <View style={styles.trendCard}>
                <Text style={styles.noDataText}>Your reading trends will appear here soon.</Text>
                {stats.swipePatterns && (
                  <View style={styles.swipeRow}>
                    <Text style={styles.swipeLabel}>Up Swipes (Save):</Text>
                    <Text style={styles.swipeValue}>{stats.swipePatterns.upSwipes || 0}</Text>
                    <Text style={styles.swipeLabel}>Down Swipes (Skip):</Text>
                    <Text style={styles.swipeValue}>{stats.swipePatterns.downSwipes || 0}</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>No analytics data available.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
