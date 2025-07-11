import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { useEnhancedAnalytics } from '../contexts/EnhancedAnalyticsContext';
import { fallbackTheme } from '../constants/theme';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface AnalyticsInsights {
  navigation: {
    totalScreenViews: number;
    mostVisitedScreens: { [key: string]: number };
    averageSessionScreens: number;
  };
  content: {
    totalEngagements: number;
    averageTimeOnContent: number;
    mostEngagedCategories: { [key: string]: number };
    readingPatterns: {
      byTimeOfDay: { [key: string]: number };
      byDayOfWeek: { [key: string]: number };
    };
  };
  performance: {
    averageLoadTimes: { [key: string]: number };
    slowestScreens: { [key: string]: number };
  };
  sessions: {
    totalSessions: number;
    averageSessionDuration: number;
  };
  search: {
    totalSearches: number;
    topSearchTerms: { [key: string]: number };
    searchSuccessRate: number;
  };
}

export default function EnhancedAnalyticsScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const activeTheme = theme || fallbackTheme;
  const styles = getStyles(activeTheme);
  
  const { getAnalyticsInsights, trackNavigation } = useEnhancedAnalytics();
  const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'navigation' | 'content' | 'performance'>('overview');

  useEffect(() => {
    trackNavigation('EnhancedAnalyticsScreen');
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await getAnalyticsInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading analytics insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTime = (hour: string): string => {
    const h = parseInt(hour);
    return h < 12 ? `${h === 0 ? 12 : h}AM` : `${h === 12 ? 12 : h - 12}PM`;
  };

  const formatDay = (day: string): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[parseInt(day)] || day;
  };

  const StatCard = ({ title, value, subtitle, icon }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={20} color={activeTheme.colors.primary} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const TopItemsList = ({ title, items, formatter }: {
    title: string;
    items: { [key: string]: number };
    formatter?: (key: string) => string;
  }) => {
    const sortedItems = Object.entries(items)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return (
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>{title}</Text>
        {sortedItems.map(([key, value], index) => (
          <View key={key} style={styles.listItem}>
            <Text style={styles.listItemText}>
              {formatter ? formatter(key) : key}
            </Text>
            <Text style={styles.listItemValue}>{value}</Text>
          </View>
        ))}
      </View>
    );
  };

  const TabButton = ({ tab, title }: { tab: string; title: string }) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tab && styles.activeTabButton]}
      onPress={() => setSelectedTab(tab as any)}
    >
      <Text style={[styles.tabButtonText, selectedTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <StatCard
          title="Screen Views"
          value={insights?.navigation.totalScreenViews || 0}
          subtitle="Total navigations"
          icon="navigation"
        />
        <StatCard
          title="Content Engagements"
          value={insights?.content.totalEngagements || 0}
          subtitle="Article interactions"
          icon="eye"
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          title="Sessions"
          value={insights?.sessions.totalSessions || 0}
          subtitle="App sessions"
          icon="clock"
        />
        <StatCard
          title="Searches"
          value={insights?.search.totalSearches || 0}
          subtitle="Search queries"
          icon="search"
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          title="Avg. Session Duration"
          value={formatDuration(insights?.sessions.averageSessionDuration || 0)}
          subtitle="Time per session"
          icon="clock"
        />
        <StatCard
          title="Avg. Reading Time"
          value={`${Math.round(insights?.content.averageTimeOnContent || 0)}s`}
          subtitle="Time per article"
          icon="book-open"
        />
      </View>
      <View style={styles.visualSection}>
        <Text style={styles.sectionTitle}>Reading Trends</Text>
        <LineChart
          data={{
            labels: Object.keys(insights?.content.readingPatterns.byTimeOfDay || {}).map(h => formatTime(h)),
            datasets: [{
              data: Object.values(insights?.content.readingPatterns.byTimeOfDay || {})
            }],
          }}
          width={width - 40}
          height={180}
          yAxisLabel={''}
          chartConfig={{
            backgroundColor: activeTheme.colors.card,
            backgroundGradientFrom: activeTheme.colors.card,
            backgroundGradientTo: activeTheme.colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => activeTheme.colors.primary,
            labelColor: (opacity = 1) => activeTheme.colors.textSecondary,
            style: { borderRadius: 16 },
            propsForDots: { r: '5', strokeWidth: '2', stroke: activeTheme.colors.primary },
          }}
          bezier
          style={{ borderRadius: 16 }}
        />
      </View>
      <View style={styles.visualSection}>
        <Text style={styles.sectionTitle}>Category Distribution</Text>
        <PieChart
          data={Object.entries(insights?.content.mostEngagedCategories || {}).map(([cat, value], i) => ({
            name: cat,
            population: value,
            color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#DC2626', '#6B7280'][i % 8],
            legendFontColor: activeTheme.colors.textSecondary,
            legendFontSize: 12,
          }))}
          width={width - 40}
          height={180}
          chartConfig={{
            backgroundColor: activeTheme.colors.card,
            backgroundGradientFrom: activeTheme.colors.card,
            backgroundGradientTo: activeTheme.colors.card,
            color: (opacity = 1) => activeTheme.colors.primary,
            labelColor: (opacity = 1) => activeTheme.colors.textSecondary,
          }}
          accessor={'population'}
          backgroundColor={'transparent'}
          paddingLeft={'16'}
          absolute
        />
      </View>
    </View>
  );

  const renderNavigation = () => (
    <View style={styles.tabContent}>
      <StatCard
        title="Screens per Session"
        value={Math.round(insights?.navigation.averageSessionScreens || 0)}
        subtitle="Average navigation depth"
        icon="layers"
      />

      <TopItemsList
        title="Most Visited Screens"
        items={insights?.navigation.mostVisitedScreens || {}}
      />
    </View>
  );

  const renderContent = () => (
    <View style={styles.tabContent}>
      <TopItemsList
        title="Most Engaged Categories"
        items={insights?.content.mostEngagedCategories || {}}
      />

      <TopItemsList
        title="Reading by Time of Day"
        items={insights?.content.readingPatterns.byTimeOfDay || {}}
        formatter={formatTime}
      />

      <TopItemsList
        title="Reading by Day of Week"
        items={insights?.content.readingPatterns.byDayOfWeek || {}}
        formatter={formatDay}
      />
    </View>
  );

  const renderPerformance = () => (
    <View style={styles.tabContent}>
      <View style={styles.performanceGrid}>
        {Object.entries(insights?.performance.averageLoadTimes || {}).map(([metric, time]) => (
          <StatCard
            key={metric}
            title={metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            value={`${Math.round(time)}ms`}
            subtitle="Average load time"
            icon="zap"
          />
        ))}
      </View>

      <TopItemsList
        title="Slowest Screens"
        items={insights?.performance.slowestScreens || {}}
        formatter={(screen) => `${screen} (${Math.round(insights?.performance.slowestScreens[screen] || 0)}ms)`}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity onPress={loadInsights} style={styles.refreshButton}>
          <Icon name="refresh-cw" size={20} color={activeTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TabButton tab="overview" title="Overview" />
        <TabButton tab="navigation" title="Navigation" />
        <TabButton tab="content" title="Content" />
        <TabButton tab="performance" title="Performance" />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'navigation' && renderNavigation()}
        {selectedTab === 'content' && renderContent()}
        {selectedTab === 'performance' && renderPerformance()}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backText: {
      fontSize: 16,
      marginLeft: 8,
      fontWeight: '500',
      color: theme.colors.text,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    refreshButton: {
      padding: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
    },
    activeTabButton: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
    },
    tabButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    activeTabButtonText: {
      color: theme.colors.primary,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    tabContent: {
      paddingBottom: 40,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -6,
      marginBottom: 16,
    },
    statCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      margin: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: (width - 44) / 2,
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    statTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginLeft: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    listCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    listItemText: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
    listItemValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    performanceGrid: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    visualSection: {
      marginVertical: 18,
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
  });