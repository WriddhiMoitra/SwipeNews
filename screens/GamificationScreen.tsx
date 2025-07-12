import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { fallbackTheme } from '../constants/theme';
import { GamificationService } from '../services/gamificationService';
import { UserGamification, UserBadge, UserChallenge } from '../types/Gamification';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay, 
  withSequence, 
  withTiming,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { Award, Trophy, Target, Users, Star, Zap, Calendar, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function GamificationScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const activeTheme = theme || fallbackTheme;
  const styles = getStyles(activeTheme);
  
  const [gamificationData, setGamificationData] = useState<UserGamification | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'badges' | 'challenges' | 'leaderboard'>('overview');
  
  const gamificationService = GamificationService.getInstance();
  
  // Animations
  const pointsAnimation = useSharedValue(0);
  const levelAnimation = useSharedValue(0);
  const badgeAnimations = useSharedValue(0);
  const celebrationAnimation = useSharedValue(0);

  useEffect(() => {
    loadGamificationData();
  }, [user]);

  useEffect(() => {
    if (gamificationData) {
      // Animate points counter
      pointsAnimation.value = withSpring(gamificationData.totalPoints, { damping: 15, stiffness: 100 });
      levelAnimation.value = withSpring(gamificationData.level, { damping: 15, stiffness: 100 });
      badgeAnimations.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 200 }));
    }
  }, [gamificationData]);

  const loadGamificationData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [data, leaderboardData, rank] = await Promise.all([
        gamificationService.getUserGamification(user.id),
        gamificationService.getLeaderboard(10),
        gamificationService.getUserRank(user.id)
      ]);
      
      setGamificationData(data);
      setLeaderboard(leaderboardData);
      setUserRank(rank);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerCelebration = () => {
    celebrationAnimation.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 300 })
    );
  };

  const animatedPointsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pointsAnimation.value > 0 ? 1.1 : 1) }],
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    opacity: badgeAnimations.value,
    transform: [{ scale: badgeAnimations.value }],
  }));

  const celebrationStyle = useAnimatedStyle(() => ({
    opacity: celebrationAnimation.value,
    transform: [{ scale: interpolate(celebrationAnimation.value, [0, 1], [0.8, 1.2]) }],
  }));

  const getBadgeIcon = (badge: UserBadge) => {
    return badge.icon || '🏆';
  };

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6B7280';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getProgressToNextLevel = () => {
    if (!gamificationData) return 0;
    const currentLevelPoints = (gamificationData.level - 1) * 1000;
    const nextLevelPoints = gamificationData.level * 1000;
    const progress = ((gamificationData.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Level and Points Card */}
      <View style={styles.card}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradientCard}
        >
          <View style={styles.levelContainer}>
            <Animated.View style={animatedPointsStyle}>
              <Text style={styles.levelText}>Level {gamificationData?.level || 1}</Text>
              <Text style={styles.pointsText}>{gamificationData?.totalPoints || 0} Points</Text>
            </Animated.View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getProgressToNextLevel()}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {Math.round(getProgressToNextLevel())}% to Level {(gamificationData?.level || 1) + 1}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Trophy size={24} color={activeTheme.colors.primary} />
          <Text style={styles.statNumber}>{gamificationData?.weeklyPoints || 0}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Award size={24} color={activeTheme.colors.primary} />
          <Text style={styles.statNumber}>{gamificationData?.badges.filter(b => b.unlockedAt).length || 0}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
        <View style={styles.statCard}>
          <Zap size={24} color={activeTheme.colors.primary} />
          <Text style={styles.statNumber}>{gamificationData?.streaks[0]?.currentCount || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color={activeTheme.colors.primary} />
          <Text style={styles.statNumber}>#{userRank > 0 ? userRank : '--'}</Text>
          <Text style={styles.statLabel}>Global Rank</Text>
        </View>
      </View>

      {/* Recent Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {gamificationData?.badges.filter(b => b.unlockedAt).slice(0, 5).map((badge, index) => (
            <Animated.View key={badge.id} style={[styles.badgeCard, animatedBadgeStyle]}>
              <Text style={styles.badgeIcon}>{getBadgeIcon(badge)}</Text>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <View style={[styles.rarityIndicator, { backgroundColor: getBadgeColor(badge.rarity) }]} />
            </Animated.View>
          )) || []}
          {(!gamificationData?.badges.filter(b => b.unlockedAt).length) && (
            <View style={styles.emptyBadges}>
              <Text style={styles.emptyText}>Complete challenges to earn your first badge!</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Active Challenges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Challenges</Text>
        {gamificationData?.activeChallenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Target size={20} color={activeTheme.colors.primary} />
              <Text style={styles.challengeName}>{challenge.name}</Text>
              <Text style={styles.challengeReward}>+{challenge.reward.points} pts</Text>
            </View>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
            <View style={styles.challengeProgress}>
              <View style={styles.challengeProgressBar}>
                <View style={[
                  styles.challengeProgressFill, 
                  { width: `${(challenge.progress / challenge.target) * 100}%` }
                ]} />
              </View>
              <Text style={styles.challengeProgressText}>
                {challenge.progress}/{challenge.target}
              </Text>
            </View>
          </View>
        )) || []}
      </View>
    </ScrollView>
  );

  const renderBadges = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.badgesGrid}>
        {gamificationService['BADGES'].map((badge, index) => {
          const userBadge = gamificationData?.badges.find(b => b.id === badge.id);
          const isUnlocked = userBadge?.unlockedAt;
          const progress = userBadge?.progress || 0;
          
          return (
            <Animated.View 
              key={badge.id} 
              style={[
                styles.badgeGridCard, 
                { opacity: isUnlocked ? 1 : 0.6 },
                animatedBadgeStyle
              ]}
            >
              <Text style={styles.badgeGridIcon}>{badge.icon}</Text>
              <Text style={styles.badgeGridName}>{badge.name}</Text>
              <Text style={styles.badgeGridDescription}>{badge.description}</Text>
              <View style={[styles.rarityIndicator, { backgroundColor: getBadgeColor(badge.rarity) }]} />
              {!isUnlocked && progress > 0 && (
                <View style={styles.badgeProgressContainer}>
                  <View style={styles.badgeProgressBar}>
                    <View style={[styles.badgeProgressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.badgeProgressText}>{Math.round(progress)}%</Text>
                </View>
              )}
              {isUnlocked && (
                <View style={styles.unlockedIndicator}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderChallenges = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Active Challenges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        {gamificationData?.activeChallenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Target size={20} color={activeTheme.colors.primary} />
              <Text style={styles.challengeName}>{challenge.name}</Text>
              <Text style={styles.challengeReward}>+{challenge.reward.points} pts</Text>
            </View>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
            <View style={styles.challengeProgress}>
              <View style={styles.challengeProgressBar}>
                <View style={[
                  styles.challengeProgressFill, 
                  { width: `${(challenge.progress / challenge.target) * 100}%` }
                ]} />
              </View>
              <Text style={styles.challengeProgressText}>
                {challenge.progress}/{challenge.target}
              </Text>
            </View>
            <Text style={styles.challengeExpiry}>
              Expires: {challenge.expiresAt.toLocaleDateString()}
            </Text>
          </View>
        )) || []}
      </View>

      {/* Completed Challenges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed Challenges</Text>
        {gamificationData?.completedChallenges.slice(0, 10).map((challenge) => (
          <View key={challenge.id} style={[styles.challengeCard, styles.completedChallenge]}>
            <View style={styles.challengeHeader}>
              <Star size={20} color="#10B981" />
              <Text style={styles.challengeName}>{challenge.name}</Text>
              <Text style={styles.challengeReward}>✅ +{challenge.reward.points} pts</Text>
            </View>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
            <Text style={styles.challengeCompleted}>
              Completed: {challenge.completedAt?.toLocaleDateString()}
            </Text>
          </View>
        )) || []}
      </View>
    </ScrollView>
  );

  const renderLeaderboard = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Global Leaderboard</Text>
        {leaderboard.map((entry, index) => (
          <View key={entry.userId} style={[
            styles.leaderboardItem,
            entry.userId === user?.id && styles.currentUserItem
          ]}>
            <View style={styles.rankContainer}>
              <Text style={[
                styles.rankText,
                index < 3 && styles.topRankText
              ]}>
                #{entry.rank}
              </Text>
              {index === 0 && <Trophy size={20} color="#FFD700" />}
              {index === 1 && <Trophy size={20} color="#C0C0C0" />}
              {index === 2 && <Trophy size={20} color="#CD7F32" />}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {entry.userId === user?.id ? 'You' : `User ${entry.userId.slice(0, 8)}`}
              </Text>
              <Text style={styles.userLevel}>Level {entry.level}</Text>
            </View>
            <Text style={styles.userPoints}>{entry.points} pts</Text>
          </View>
        ))}
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
          <Text style={styles.headerTitle}>Achievements</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading your achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Celebration Animation Overlay */}
      <Animated.View style={[styles.celebrationOverlay, celebrationStyle]} pointerEvents="none">
        <Text style={styles.celebrationText}>🎉 Achievement Unlocked! 🎉</Text>
      </Animated.View>

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <TouchableOpacity onPress={loadGamificationData} style={styles.refreshButton}>
          <Icon name="refresh-cw" size={20} color={activeTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: 'home' },
          { key: 'badges', label: 'Badges', icon: 'award' },
          { key: 'challenges', label: 'Challenges', icon: 'target' },
          { key: 'leaderboard', label: 'Leaderboard', icon: 'users' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Icon 
              name={tab.icon} 
              size={16} 
              color={selectedTab === tab.key ? activeTheme.colors.primary : activeTheme.colors.textSecondary} 
            />
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
        {selectedTab === 'badges' && renderBadges()}
        {selectedTab === 'challenges' && renderChallenges()}
        {selectedTab === 'leaderboard' && renderLeaderboard()}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (activeTheme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: activeTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: activeTheme.colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: activeTheme.colors.text,
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
    color: activeTheme.colors.textSecondary,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    zIndex: 1000,
    backgroundColor: activeTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  celebrationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: activeTheme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: activeTheme.colors.surface,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: activeTheme.colors.textSecondary,
  },
  activeTabText: {
    color: activeTheme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientCard: {
    padding: 24,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: activeTheme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: activeTheme.colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: activeTheme.colors.primary,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: activeTheme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: activeTheme.colors.text,
    marginBottom: 12,
  },
  badgeCard: {
    backgroundColor: activeTheme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: activeTheme.colors.border,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: activeTheme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  rarityIndicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  emptyBadges: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: activeTheme.colors.textSecondary,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  badgeGridCard: {
    width: (width - 60) / 2,
    backgroundColor: activeTheme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: activeTheme.colors.border,
    position: 'relative',
  },
  badgeGridIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  badgeGridName: {
    fontSize: 14,
    fontWeight: '600',
    color: activeTheme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeGridDescription: {
    fontSize: 12,
    color: activeTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeProgressContainer: {
    width: '100%',
    marginTop: 8,
  },
  badgeProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: activeTheme.colors.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  badgeProgressFill: {
    height: '100%',
    backgroundColor: activeTheme.colors.primary,
    borderRadius: 2,
  },
  badgeProgressText: {
    fontSize: 10,
    color: activeTheme.colors.textSecondary,
    textAlign: 'center',
  },
  unlockedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  challengeCard: {
    backgroundColor: activeTheme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: activeTheme.colors.border,
  },
  completedChallenge: {
    opacity: 0.7,
    backgroundColor: activeTheme.colors.surface,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: activeTheme.colors.text,
    marginLeft: 8,
  },
  challengeReward: {
    fontSize: 14,
    fontWeight: '600',
    color: activeTheme.colors.primary,
  },
  challengeDescription: {
    fontSize: 14,
    color: activeTheme.colors.textSecondary,
    marginBottom: 12,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: activeTheme.colors.border,
    borderRadius: 3,
    marginRight: 12,
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: activeTheme.colors.primary,
    borderRadius: 3,
  },
  challengeProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: activeTheme.colors.text,
    minWidth: 40,
  },
  challengeExpiry: {
    fontSize: 12,
    color: activeTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
  challengeCompleted: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: activeTheme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: activeTheme.colors.border,
  },
  currentUserItem: {
    borderColor: activeTheme.colors.primary,
    backgroundColor: activeTheme.colors.primary + '10',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: activeTheme.colors.text,
    marginRight: 8,
  },
  topRankText: {
    color: activeTheme.colors.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: activeTheme.colors.text,
  },
  userLevel: {
    fontSize: 12,
    color: activeTheme.colors.textSecondary,
  },
  userPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: activeTheme.colors.primary,
  },
});