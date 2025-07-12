import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserBadge, UserStreak, UserChallenge, UserGamification } from '../types/Gamification';
import { UserProfileService } from './userProfileService';

const GAMIFICATION_KEY = 'user_gamification';
const LEADERBOARD_KEY = 'global_leaderboard';

export class GamificationService {
  private static instance: GamificationService;
  private userProfileService = UserProfileService.getInstance();

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // Available badges with enhanced system
  private readonly BADGES: Omit<UserBadge, 'unlockedAt' | 'progress'>[] = [
    {
      id: 'first_read',
      name: 'First Steps',
      description: 'Read your first article',
      icon: '📖',
      category: 'reading',
      rarity: 'common',
      requirement: 1
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Read 5 articles before 9 AM',
      icon: '🌅',
      category: 'engagement',
      rarity: 'rare',
      requirement: 5
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Read 5 articles after 10 PM',
      icon: '🦉',
      category: 'engagement',
      rarity: 'rare',
      requirement: 5
    },
    {
      id: 'bookworm',
      name: 'Bookworm',
      description: 'Read 50 articles',
      icon: '🐛',
      category: 'reading',
      rarity: 'rare',
      requirement: 50
    },
    {
      id: 'news_addict',
      name: 'News Addict',
      description: 'Read 200 articles',
      icon: '📰',
      category: 'reading',
      rarity: 'epic',
      requirement: 200
    },
    {
      id: 'sharing_star',
      name: 'Sharing Star',
      description: 'Share 25 articles',
      icon: '⭐',
      category: 'sharing',
      rarity: 'rare',
      requirement: 25
    },
    {
      id: 'week_warrior',
      name: 'Week Warrior',
      description: 'Read articles for 7 days straight',
      icon: '🔥',
      category: 'streak',
      rarity: 'epic',
      requirement: 7
    },
    {
      id: 'month_master',
      name: 'Month Master',
      description: 'Read articles for 30 days straight',
      icon: '👑',
      category: 'streak',
      rarity: 'legendary',
      requirement: 30
    },
    {
      id: 'explorer',
      name: 'Explorer',
      description: 'Read articles from 5 different categories',
      icon: '🗺️',
      category: 'discovery',
      rarity: 'rare',
      requirement: 5
    },
    {
      id: 'speed_reader',
      name: 'Speed Reader',
      description: 'Read 10 articles in one day',
      icon: '⚡',
      category: 'engagement',
      rarity: 'epic',
      requirement: 10
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Share articles 5 days in a row',
      icon: '🦋',
      category: 'sharing',
      rarity: 'epic',
      requirement: 5
    },
    {
      id: 'completionist',
      name: 'Completionist',
      description: 'Complete 10 daily challenges',
      icon: '✅',
      category: 'engagement',
      rarity: 'legendary',
      requirement: 10
    }
  ];

  async getUserGamification(userId: string): Promise<UserGamification> {
    try {
      const stored = await AsyncStorage.getItem(`${GAMIFICATION_KEY}_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          ...data,
          lastActivityDate: new Date(data.lastActivityDate),
          badges: data.badges.map((b: any) => ({
            ...b,
            unlockedAt: b.unlockedAt ? new Date(b.unlockedAt) : undefined
          })),
          streaks: data.streaks.map((s: any) => ({
            ...s,
            lastActivityDate: new Date(s.lastActivityDate)
          })),
          activeChallenges: data.activeChallenges.map((c: any) => ({
            ...c,
            expiresAt: new Date(c.expiresAt)
          })),
          completedChallenges: data.completedChallenges.map((c: any) => ({
            ...c,
            expiresAt: new Date(c.expiresAt),
            completedAt: c.completedAt ? new Date(c.completedAt) : undefined
          }))
        };
      }

      // Create default gamification profile
      const defaultGamification: UserGamification = {
        userId,
        totalPoints: 0,
        level: 1,
        badges: [],
        streaks: [
          {
            type: 'daily_reading',
            currentCount: 0,
            bestCount: 0,
            lastActivityDate: new Date(),
            isActive: false
          }
        ],
        activeChallenges: await this.generateDailyChallenges(),
        completedChallenges: [],
        weeklyPoints: 0,
        monthlyPoints: 0,
        lastActivityDate: new Date()
      };

      await this.saveGamification(defaultGamification);
      return defaultGamification;
    } catch (error) {
      console.error('Error getting user gamification:', error);
      throw error;
    }
  }

  async saveGamification(gamification: UserGamification): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${GAMIFICATION_KEY}_${gamification.userId}`,
        JSON.stringify(gamification)
      );
      
      // Update leaderboard
      await this.updateLeaderboard(gamification.userId, gamification.totalPoints);
    } catch (error) {
      console.error('Error saving gamification:', error);
    }
  }

  async awardPoints(userId: string, points: number, reason: string): Promise<UserGamification> {
    const gamification = await this.getUserGamification(userId);
    
    gamification.totalPoints += points;
    gamification.weeklyPoints += points;
    gamification.monthlyPoints += points;
    
    // Level up calculation (every 1000 points = 1 level)
    const newLevel = Math.floor(gamification.totalPoints / 1000) + 1;
    if (newLevel > gamification.level) {
      gamification.level = newLevel;
      // Award bonus points for leveling up
      gamification.totalPoints += 100;
    }

    gamification.lastActivityDate = new Date();
    await this.saveGamification(gamification);
    
    // Check for new badges
    await this.checkAndAwardBadges(userId);
    
    return gamification;
  }

  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    const gamification = await this.getUserGamification(userId);
    const profile = await this.userProfileService.getUserProfile(userId);
    const newBadges: UserBadge[] = [];

    for (const badgeTemplate of this.BADGES) {
      // Skip if already unlocked
      if (gamification.badges.some(b => b.id === badgeTemplate.id)) continue;

      let shouldAward = false;
      let progress = 0;

      switch (badgeTemplate.id) {
        case 'first_read':
          shouldAward = profile.behaviorData.totalArticlesRead >= 1;
          progress = Math.min(100, (profile.behaviorData.totalArticlesRead / 1) * 100);
          break;
        case 'bookworm':
          shouldAward = profile.behaviorData.totalArticlesRead >= 50;
          progress = Math.min(100, (profile.behaviorData.totalArticlesRead / 50) * 100);
          break;
        case 'news_addict':
          shouldAward = profile.behaviorData.totalArticlesRead >= 200;
          progress = Math.min(100, (profile.behaviorData.totalArticlesRead / 200) * 100);
          break;
        case 'sharing_star':
          shouldAward = profile.behaviorData.totalArticlesShared >= 25;
          progress = Math.min(100, (profile.behaviorData.totalArticlesShared / 25) * 100);
          break;
        case 'week_warrior':
          shouldAward = gamification.streaks[0]?.bestCount >= 7;
          progress = Math.min(100, ((gamification.streaks[0]?.bestCount || 0) / 7) * 100);
          break;
        case 'month_master':
          shouldAward = gamification.streaks[0]?.bestCount >= 30;
          progress = Math.min(100, ((gamification.streaks[0]?.bestCount || 0) / 30) * 100);
          break;
        case 'explorer':
          const categoriesRead = new Set(
            profile.categoryPreferences
              .filter(cp => cp.interactionCount > 0)
              .map(cp => cp.category)
          ).size;
          shouldAward = categoriesRead >= 5;
          progress = Math.min(100, (categoriesRead / 5) * 100);
          break;
        case 'speed_reader':
          // This would need daily tracking - simplified for now
          shouldAward = profile.behaviorData.totalArticlesRead >= 10;
          progress = Math.min(100, (profile.behaviorData.totalArticlesRead / 10) * 100);
          break;
      }

      if (shouldAward) {
        const newBadge: UserBadge = {
          ...badgeTemplate,
          unlockedAt: new Date(),
          progress: 100
        };
        gamification.badges.push(newBadge);
        newBadges.push(newBadge);
        
        // Award points for badge
        gamification.totalPoints += this.getBadgePoints(badgeTemplate.rarity);
      } else if (progress > 0) {
        // Update progress for badges in progress
        const existingBadge = gamification.badges.find(b => b.id === badgeTemplate.id);
        if (!existingBadge) {
          gamification.badges.push({
            ...badgeTemplate,
            progress
          });
        }
      }
    }

    if (newBadges.length > 0) {
      await this.saveGamification(gamification);
    }

    return newBadges;
  }

  private getBadgePoints(rarity: string): number {
    switch (rarity) {
      case 'common': return 100;
      case 'rare': return 250;
      case 'epic': return 500;
      case 'legendary': return 1000;
      default: return 100;
    }
  }

  async updateStreak(userId: string, activityType: 'daily_reading'): Promise<void> {
    const gamification = await this.getUserGamification(userId);
    const streak = gamification.streaks.find(s => s.type === activityType);
    
    if (streak) {
      const today = new Date();
      const lastActivity = streak.lastActivityDate;
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Continue streak
        streak.currentCount++;
        streak.isActive = true;
      } else if (daysDiff === 0) {
        // Same day, no change
        return;
      } else {
        // Streak broken, reset
        streak.currentCount = 1;
        streak.isActive = true;
      }

      if (streak.currentCount > streak.bestCount) {
        streak.bestCount = streak.currentCount;
      }

      streak.lastActivityDate = today;
      await this.saveGamification(gamification);
    }
  }

  private async generateDailyChallenges(): Promise<UserChallenge[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    return [
      {
        id: 'daily_reader',
        name: 'Daily Reader',
        description: 'Read 5 articles today',
        type: 'daily',
        target: 5,
        progress: 0,
        reward: { points: 100 },
        expiresAt: tomorrow
      },
      {
        id: 'category_explorer',
        name: 'Category Explorer',
        description: 'Read articles from 3 different categories',
        type: 'daily',
        target: 3,
        progress: 0,
        reward: { points: 150 },
        expiresAt: tomorrow
      },
      {
        id: 'sharing_challenge',
        name: 'Share the Knowledge',
        description: 'Share 2 articles today',
        type: 'daily',
        target: 2,
        progress: 0,
        reward: { points: 75 },
        expiresAt: tomorrow
      }
    ];
  }

  async updateChallengeProgress(userId: string, challengeType: string, increment: number = 1): Promise<void> {
    const gamification = await this.getUserGamification(userId);
    
    const challenge = gamification.activeChallenges.find(c => c.id === challengeType);
    if (challenge && !challenge.completedAt) {
      challenge.progress = Math.min(challenge.target, challenge.progress + increment);
      
      if (challenge.progress >= challenge.target) {
        challenge.completedAt = new Date();
        gamification.completedChallenges.push(challenge);
        gamification.activeChallenges = gamification.activeChallenges.filter(c => c.id !== challengeType);
        
        // Award challenge points
        gamification.totalPoints += challenge.reward.points;
      }
      
      await this.saveGamification(gamification);
    }
  }

  // Leaderboard functionality
  async updateLeaderboard(userId: string, points: number): Promise<void> {
    try {
      const leaderboardData = await AsyncStorage.getItem(LEADERBOARD_KEY);
      let leaderboard: { [userId: string]: { points: number, level: number, name?: string } } = {};
      
      if (leaderboardData) {
        leaderboard = JSON.parse(leaderboardData);
      }
      
      const level = Math.floor(points / 1000) + 1;
      leaderboard[userId] = { points, level };
      
      await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  async getLeaderboard(limit: number = 10): Promise<Array<{ userId: string, points: number, level: number, rank: number }>> {
    try {
      const leaderboardData = await AsyncStorage.getItem(LEADERBOARD_KEY);
      if (!leaderboardData) return [];
      
      const leaderboard = JSON.parse(leaderboardData);
      const sortedEntries = Object.entries(leaderboard)
        .map(([userId, data]: [string, any]) => ({
          userId,
          points: data.points,
          level: data.level,
          rank: 0
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, limit);
      
      // Add ranks
      sortedEntries.forEach((entry, index) => {
        entry.rank = index + 1;
      });
      
      return sortedEntries;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async getUserRank(userId: string): Promise<number> {
    try {
      const leaderboard = await this.getLeaderboard(1000); // Get more entries to find rank
      const userEntry = leaderboard.find(entry => entry.userId === userId);
      return userEntry ? userEntry.rank : -1;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return -1;
    }
  }

  async resetWeeklyPoints(userId: string): Promise<void> {
    const gamification = await this.getUserGamification(userId);
    gamification.weeklyPoints = 0;
    await this.saveGamification(gamification);
  }

  async resetMonthlyPoints(userId: string): Promise<void> {
    const gamification = await this.getUserGamification(userId);
    gamification.monthlyPoints = 0;
    await this.saveGamification(gamification);
  }
}