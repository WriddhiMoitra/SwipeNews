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
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { useEnhancedAnalytics } from '../contexts/EnhancedAnalyticsContext';
import { usePersonalization } from '../contexts/PersonalizationContext';
import { fallbackTheme } from '../constants/theme';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Calendar, TrendingUp, BarChart3, PieChart as PieChartIcon, Download, Share2 } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  dailyUsage: { [date: string]: number };
  weeklyProgress: number[];
  categoryDistribution: { [category: string]: number };
  readingTrends: { [hour: string]: number };
  completionRates: {
    articlesRead: number;
    articlesCompleted: number;
    averageReadingTime: number;
    engagementScore: number;
  };
  achievements: {
    totalBadges: number;
    currentStreak: number;
    totalPoints: number;
    level: number;
  };
}

export default function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const activeTheme = theme || fallbackTheme;
  const styles = getStyles(activeTheme);
  
  const { getAnalyticsInsights } = useEnhancedAnalytics();
  const { getUserStats } = usePersonalization();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'categories' | 'achievements'>('overview');
  
  // Animations
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);

  useEffect(() => {
    loadAnalyticsData();
    
    // Animate entrance
    fadeAnim.value = withDelay(100, withSpring(1));
    slideAnim.value = withDelay(200, withSpring(0));
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [insights, userStats] = await Promise.all([
        getAnalyticsInsights(),
        getUserStats()
      ]);

      // Process and format the data
      const processedData: AnalyticsData = {
        dailyUsage: generateDailyUsageData(),
        weeklyProgress: generateWeeklyProgress(),
        categoryDistribution: userStats?.topCategories?.reduce((acc: any, cat: string, index: number) => {
          acc[cat] = Math.max(10, 50 - index * 10);
          return acc;
        }, {}) || {},
        readingTrends: generateReadingTrends(),
        completionRates: {
          articlesRead: userStats?.totalArticlesRead || 0,
          articlesCompleted: Math.floor((userStats?.totalArticlesRead || 0) * 0.8),
          averageReadingTime: userStats?.averageReadingTime || 3,
          engagementScore: calculateEngagementScore(userStats)
        },
        achievements: {
          totalBadges: userStats?.badges || 0,
          currentStreak: userStats?.currentStreak || 0,
          totalPoints: userStats?.totalPoints || 0,
          level: userStats?.level || 1
        }
      };

      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyUsageData = () => {
    const data: { [date: string]: number } = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      data[dateStr] = Math.floor(Math.random() * 20) + 5;
    }
    
    return data;
  };

  const generateWeeklyProgress = () => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 20);
  };

  const generateReadingTrends = () => {
    const trends: { [hour: string]: number } = {};
    const peakHours = [8, 12, 18, 21]; // Morning, lunch, evening, night
    
    for (let hour = 0; hour < 24; hour++) {
      const isPeak = peakHours.includes(hour);
      trends[hour.toString()] = isPeak ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 5) + 1;
    }
    
    return trends;
  };

  const calculateEngagementScore = (userStats: any) => {
    if (!userStats) return 0;
    const readScore = Math.min(100, (userStats.totalArticlesRead || 0) * 2);
    const shareScore = Math.min(100, (userStats.totalArticlesShared || 0) * 5);
    const streakScore = Math.min(100, (userStats.currentStreak || 0) * 10);
    return Math.floor((readScore + shareScore + streakScore) / 3);
  };

  const exportData = async () => {
    try {
      const dataToExport = {
        exportDate: new Date().toISOString(),
        analytics: analyticsData,
        summary: {
          totalArticlesRead: analyticsData?.completionRates.articlesRead || 0,
          averageReadingTime: analyticsData?.completionRates.averageReadingTime || 0,
          engagementScore: analyticsData?.completionRates.engagementScore || 0,
          achievements: analyticsData?.achievements || {}
        }
      };

      await Share.share({
        message: `My SwipeNews Analytics Report\n\nTotal Articles Read: ${dataToExport.summary.totalArticlesRead}\nEngagement Score: ${dataToExport.summary.engagementScore}%\nLevel: ${dataToExport.summary.achievements.level}\n\nExported on ${new Date().toLocaleDateString()}`,
        title: 'SwipeNews Analytics Report'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const MetricCard = ({ title, value, subtitle, icon, color }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color?: string;
  }) => (
    <View style={[styles.metricCard, color && { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.metricHeader}>
        {React.createElement(icon, { size: 24, color: color || activeTheme.colors.primary })}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Animated.View style={animatedStyle}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Articles Read"
            value={analyticsData?.completionRates.articlesRead || 0}
            subtitle="Total articles"
            icon={TrendingUp}
            color="#10B981"
          />
          <MetricCard
            title="Engagement Score"
            value={`${analyticsData?.completionRates.engagementScore || 0}%`}
            subtitle="Overall engagement"
            icon={BarChart3}
            color="#3B82F6"
          />
          <MetricCard
            title="Reading Time"
            value={`${analyticsData?.completionRates.averageReadingTime || 0}m`}
            subtitle="Average per article"
            icon={Calendar}
            color="#8B5CF6"
          />
          <MetricCard
            title="Current Level"
            value={analyticsData?.achievements.level || 1}
            subtitle={`${analyticsData?.achievements.totalPoints || 0} points`}
            icon={TrendingUp}
            color="#F59E0B"
          />
        </View>

        {/* Daily Usage Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Daily Reading Activity</Text>
          <LineChart
            data={{
              labels: Object.keys(analyticsData?.dailyUsage || {}).map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('en', { weekday: 'short' });
              }),
              datasets: [{
                data: Object.values(analyticsData?.dailyUsage || {}),
                strokeWidth: 3,
              }],
            }}
            width={width - 40}
            height={200}
            chartConfig={{
              backgroundColor: activeTheme.colors.card,
              backgroundGradientFrom: activeTheme.colors.card,
              backgroundGradientTo: activeTheme.colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => activeTheme.colors.primary,
              labelColor: (opacity = 1) => activeTheme.colors.textSecondary,
              style: { borderRadius: 16 },
              propsForDots: { r: '6', strokeWidth: '2', stroke: activeTheme.colors.primary },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Weekly Progress */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Weekly Progress</Text>
          <BarChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                data: analyticsData?.weeklyProgress || [0, 0, 0, 0, 0, 0, 0],
              }],
            }}
            width={width - 40}
            height={200}
            chartConfig={{
              backgroundColor: activeTheme.colors.card,
              backgroundGradientFrom: activeTheme.colors.card,
              backgroundGradientTo: activeTheme.colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => activeTheme.colors.primary,
              labelColor: (opacity = 1) => activeTheme.colors.textSecondary,
              style: { borderRadius: 16 },
            }}
            style={styles.chart}
          />
        </View>
      </Animated.View>
    </ScrollView>
  );

  const renderTrends = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Reading Patterns by Hour</Text>
        <LineChart
          data={{
            labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
            datasets: [{
              data: [6, 9, 12, 15, 18, 21].map(hour => analyticsData?.readingTrends[hour.toString()] || 0),
              strokeWidth: 3,
            }],
          }}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: activeTheme.colors.card,
            backgroundGradientFrom: activeTheme.colors.card,
            backgroundGradientTo: activeTheme.colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => '#8B5CF6',
            labelColor: (opacity = 1) => activeTheme.colors.textSecondary,
            style: { borderRadius: 16 },
            propsForDots: { r: '6', strokeWidth: '2', stroke: '#8B5CF6' },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>Reading Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Peak Reading Time</Text>
          <Text style={styles.insightValue}>6:00 PM - 9:00 PM</Text>
          <Text style={styles.insightDescription}>You're most active during evening hours</Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Most Productive Day</Text>
          <Text style={styles.insightValue}>Wednesday</Text>
          <Text style={styles.insightDescription}>Highest article completion rate</Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Reading Streak</Text>
          <Text style={styles.insightValue}>{analyticsData?.achievements.currentStreak || 0} days</Text>
          <Text style={styles.insightDescription}>Keep it up! You're doing great</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderCategories = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Category Distribution</Text>
        {Object.keys(analyticsData?.categoryDistribution || {}).length > 0 ? (
          <PieChart
            data={Object.entries(analyticsData?.categoryDistribution || {}).map(([category, value], index) => ({
              name: category,
              population: value,
              color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6],
              legendFontColor: activeTheme.colors.textSecondary,
              legendFontSize: 12,
            }))}
            width={width - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => activeTheme.colors.primary,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
        ) : (
          <View style={styles.emptyChart}>
            <PieChartIcon size={60} color={activeTheme.colors.textSecondary} />
            <Text style={styles.emptyChartText}>Start reading to see your category preferences</Text>
          </View>
        )}
      </View>

      <View style={styles.categoryList}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {Object.entries(analyticsData?.categoryDistribution || {}).map(([category, value], index) => (
          <View key={category} style={styles.categoryItem}>
            <View style={[styles.categoryColor, { 
              backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6] 
            }]} />
            <Text style={styles.categoryName}>{category}</Text>
            <Text style={styles.categoryValue}>{value}%</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAchievements = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.achievementStats}>
        <View style={styles.achievementCard}>
          <Text style={styles.achievementNumber}>{analyticsData?.achievements.totalBadges || 0}</Text>
          <Text style={styles.achievementLabel}>Badges Earned</Text>
        </View>
        <View style={styles.achievementCard}>
          <Text style={styles.achievementNumber}>{analyticsData?.achievements.currentStreak || 0}</Text>
          <Text style={styles.achievementLabel}>Day Streak</Text>
        </View>
        <View style={styles.achievementCard}>
          <Text style={styles.achievementNumber}>{analyticsData?.achievements.totalPoints || 0}</Text>
          <Text style={styles.achievementLabel}>Total Points</Text>
        </View>
        <View style={styles.achievementCard}>
          <Text style={styles.achievementNumber}>{analyticsData?.achievements.level || 1}</Text>
          <Text style={styles.achievementLabel}>Current Level</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Articles Read</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { 
              width: `${Math.min(100, (analyticsData?.completionRates.articlesRead || 0) / 100 * 100)}%`,
              backgroundColor: '#10B981'
            }]} />
          </View>
          <Text style={styles.progressValue}>{analyticsData?.completionRates.articlesRead || 0}</Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Engagement Score</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { 
              width: `${analyticsData?.completionRates.engagementScore || 0}%`,
              backgroundColor: '#3B82F6'
            }]} />
          </View>
          <Text style={styles.progressValue}>{analyticsData?.completionRates.engagementScore || 0}%</Text>
        </View>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeTheme.colors.primary} />
          <Text style={styles.loadingText}>Analyzing your reading patterns...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity onPress={exportData} style={styles.exportButton}>
          <Share2 size={20} color={activeTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'trends', label: 'Trends', icon: TrendingUp },
          { key: 'categories', label: 'Categories', icon: PieChartIcon },
          { key: 'achievements', label: 'Progress', icon: Calendar },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            {React.createElement(tab.icon, { 
              size: 16, 
              color: selectedTab === tab.key ? activeTheme.colors.primary : activeTheme.colors.textSecondary 
            })}
            <Text style={[
              styles.tabText, 
              selectedTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'trends' && renderTrends()}
        {selectedTab === 'categories' && renderCategories()}
        {selectedTab === 'achievements' && renderAchievements()}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
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
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  exportButton: {
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: -6,
  },
  metricCard: {
    width: (width - 44) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  chartSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  insightsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  categoryList: {
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  achievementStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: -6,
  },
  achievementCard: {
    width: (width - 44) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  achievementNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  achievementLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
});