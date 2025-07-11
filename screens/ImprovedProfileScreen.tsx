import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationTracking } from '../hooks/useNavigationTracking';
import { fallbackTheme } from '../constants/theme';
import { GamificationService } from '../services/gamificationService';
import { ProgressTrackingService } from '../services/progressTrackingService';
import { OfflineDownloadService } from '../services/offlineDownloadService';
import { UserGamification } from '../types/Gamification';
import GamificationScreen from '../screens/GamificationScreen';
import EnhancedAnalyticsScreen from '../screens/EnhancedAnalyticsScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, TrendingUp, Download, LogOut, User, Calendar, Clock, BookOpen, Share2, Target, Zap } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ImprovedProfileScreen() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const activeTheme = theme || fallbackTheme;
  
  // Add navigation tracking
  useNavigationTracking('ImprovedProfileScreen', true);
  
  const [selectedScreen, setSelectedScreen] = useState<'profile' | 'gamification' | 'analytics' | null>(null);
  const [gamificationData, setGamificationData] = useState<UserGamification | null>(null);
  const [stats, setStats] = useState({
    offlineArticles: 0,
    inProgressArticles: 0,
    completedArticles: 0,
    storageUsed: 0,
    weeklyGoal: 10,
    weeklyProgress: 0
  });

  const gamificationService = GamificationService.getInstance();
  const progressService = ProgressTrackingService.getInstance();
  const offlineService = OfflineDownloadService.getInstance();

  // Animations
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);

  useEffect(() => {
    loadUserData();
    
    // Animate entrance
    fadeAnim.value = withDelay(100, withSpring(1));
    slideAnim.value = withDelay(200, withSpring(0));
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [gamification, offlineArticles, inProgress, completed, storageSize] = await Promise.all([
        gamificationService.getUserGamification(user.id),
        offlineService.getOfflineArticles(),
        progressService.getInProgressArticles(user.id),
        progressService.getCompletedArticles(user.id),
        offlineService.getOfflineStorageSize()
      ]);
      
      setGamificationData(gamification);
      setStats({
        offlineArticles: offlineArticles.length,
        inProgressArticles: inProgress.length,
        completedArticles: completed.length,
        storageUsed: storageSize,
        weeklyGoal: 10,
        weeklyProgress: completed.filter(c => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return c.lastReadAt > weekAgo;
        }).length
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressToNextLevel = () => {
    if (!gamificationData) return 0;
    const currentLevelPoints = (gamificationData.level - 1) * 1000;
    const nextLevelPoints = gamificationData.level * 1000;
    const progress = ((gamificationData.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getWeeklyProgress = () => {
    return Math.min(100, (stats.weeklyProgress / stats.weeklyGoal) * 100);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  // Show selected screen
  if (selectedScreen === 'gamification') {
    return <GamificationScreen onBack={() => setSelectedScreen(null)} />;
  }
  
  if (selectedScreen === 'analytics') {
    return <EnhancedAnalyticsScreen onBack={() => setSelectedScreen(null)} />;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: activeTheme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60, // Add top padding for iOS status bar
      paddingBottom: 16,
      backgroundColor: activeTheme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: activeTheme.colors.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: activeTheme.colors.text,
    },
    headerSubtitle: {
      fontSize: 16,
      color: activeTheme.colors.textSecondary,
      marginTop: 4,
    },
    scrollContainer: {
      flex: 1,
    },
    section: {
      marginVertical: 16,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: activeTheme.colors.text,
      marginBottom: 16,
    },
    userCard: {
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 20,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    userGradient: {
      padding: 28,
      alignItems: 'center',
    },
    userAvatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    userName: {
      fontSize: 26,
      fontWeight: '700',
      color: 'white',
      marginBottom: 8,
      textAlign: 'center',
    },
    userEmail: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 20,
    },
    levelContainer: {
      alignItems: 'center',
      width: '100%',
    },
    levelText: {
      fontSize: 20,
      fontWeight: '600',
      color: 'white',
      marginBottom: 8,
    },
    pointsText: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
      marginBottom: 16,
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
    gamificationSection: {
      backgroundColor: activeTheme.colors.card,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: activeTheme.colors.border,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    gamificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    gamificationTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: activeTheme.colors.text,
    },
    viewAllButton: {
      backgroundColor: activeTheme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    viewAllText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    achievementGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    achievementCard: {
      flex: 1,
      backgroundColor: activeTheme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: activeTheme.colors.border,
    },
    achievementIcon: {
      marginBottom: 8,
    },
    achievementNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: activeTheme.colors.primary,
      marginBottom: 4,
    },
    achievementLabel: {
      fontSize: 12,
      color: activeTheme.colors.textSecondary,
      textAlign: 'center',
    },
    weeklyGoalCard: {
      backgroundColor: activeTheme.colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: activeTheme.colors.border,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    goalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: activeTheme.colors.text,
    },
    goalProgress: {
      fontSize: 14,
      color: activeTheme.colors.primary,
      fontWeight: '600',
    },
    goalProgressBar: {
      width: '100%',
      height: 8,
      backgroundColor: activeTheme.colors.border,
      borderRadius: 4,
      marginBottom: 8,
    },
    goalProgressFill: {
      height: '100%',
      backgroundColor: activeTheme.colors.primary,
      borderRadius: 4,
    },
    goalDescription: {
      fontSize: 14,
      color: activeTheme.colors.textSecondary,
    },
    menuSection: {
      backgroundColor: activeTheme.colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: activeTheme.colors.border,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: activeTheme.colors.border,
    },
    menuIcon: {
      marginRight: 16,
      width: 24,
      alignItems: 'center',
    },
    menuContent: {
      flex: 1,
    },
    menuTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: activeTheme.colors.text,
      marginBottom: 4,
    },
    menuSubtitle: {
      fontSize: 14,
      color: activeTheme.colors.textSecondary,
    },
    menuArrow: {
      marginLeft: 8,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EF4444',
      borderRadius: 16,
      padding: 16,
      marginTop: 20,
      marginHorizontal: 20,
      marginBottom: 40,
    },
    signOutText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Your reading journey and achievements</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={animatedStyle}>
          {/* User Card */}
          <View style={styles.section}>
            <View style={styles.userCard}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.userGradient}
              >
                <View style={styles.userAvatar}>
                  <User size={45} color="white" />
                </View>
                <Text style={styles.userName}>
                  {user?.name || user?.email?.split('@')[0] || 'News Reader'}
                </Text>
                {user?.email && (
                  <Text style={styles.userEmail}>{user.email}</Text>
                )}
                
                {gamificationData && (
                  <View style={styles.levelContainer}>
                    <Text style={styles.levelText}>Level {gamificationData.level}</Text>
                    <Text style={styles.pointsText}>{gamificationData.totalPoints} Points</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${getProgressToNextLevel()}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(getProgressToNextLevel())}% to Level {gamificationData.level + 1}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          </View>

          {/* Gamification section prominently displayed */}
          <View style={{ marginTop: 24, marginBottom: 24 }}>
            <TouchableOpacity onPress={() => setSelectedScreen('gamification')} style={{ alignItems: 'center' }}>
              <LinearGradient colors={[activeTheme.colors.primary, activeTheme.colors.secondary]} style={{ borderRadius: 20, padding: 20, width: width - 40, alignItems: 'center', shadowColor: activeTheme.colors.shadow, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }}>
                <Award size={40} color={'#fff'} />
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 10 }}>Your Achievements</Text>
                <Text style={{ color: '#fff', fontSize: 16, marginTop: 4 }}>Level {gamificationData?.level || 1} • {gamificationData?.totalPoints || 0} Points</Text>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  {gamificationData?.badges?.slice(0, 3).map(badge => (
                    <View key={badge.id} style={{ marginHorizontal: 6, alignItems: 'center' }}>
                      <Text style={{ fontSize: 28 }}>{badge.icon}</Text>
                      <Text style={{ color: '#fff', fontSize: 12 }}>{badge.name}</Text>
                    </View>
                  ))}
                </View>
                <View style={{ marginTop: 16, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 14 }}>Weekly Goal: {stats.weeklyGoal} • Progress: {stats.weeklyProgress}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedScreen('analytics')} style={{ marginTop: 18, alignItems: 'center' }}>
              <LinearGradient colors={[activeTheme.colors.secondary, activeTheme.colors.primary]} style={{ borderRadius: 16, padding: 14, width: width - 80, alignItems: 'center', shadowColor: activeTheme.colors.shadow, shadowOpacity: 0.10, shadowRadius: 6, elevation: 2 }}>
                <TrendingUp size={28} color={'#fff'} />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 6 }}>View Analytics Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Menu Section */}
          <View style={styles.section}>
            <View style={styles.menuSection}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setSelectedScreen('analytics')}
              >
                <View style={styles.menuIcon}>
                  <TrendingUp size={24} color={activeTheme.colors.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>📊 Reading Analytics</Text>
                  <Text style={styles.menuSubtitle}>Detailed insights and reading patterns</Text>
                </View>
                <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} style={styles.menuArrow} />
              </TouchableOpacity>

              <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                <View style={styles.menuIcon}>
                  <Download size={24} color={activeTheme.colors.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>📱 Offline Storage</Text>
                  <Text style={styles.menuSubtitle}>
                    {stats.offlineArticles} articles • {formatStorageSize(stats.storageUsed)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sign Out */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="white" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}