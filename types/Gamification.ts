export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reading' | 'sharing' | 'streak' | 'discovery' | 'engagement';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number; // 0-100 for badges in progress
  requirement: number; // threshold to unlock
}

export interface UserStreak {
  type: 'daily_reading' | 'weekly_discovery' | 'sharing_spree';
  currentCount: number;
  bestCount: number;
  lastActivityDate: Date;
  isActive: boolean;
}

export interface UserChallenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  progress: number;
  reward: {
    points: number;
    badge?: string;
  };
  expiresAt: Date;
  completedAt?: Date;
}

export interface UserGamification {
  userId: string;
  totalPoints: number;
  level: number;
  badges: UserBadge[];
  streaks: UserStreak[];
  activeChallenges: UserChallenge[];
  completedChallenges: UserChallenge[];
  weeklyPoints: number;
  monthlyPoints: number;
  lastActivityDate: Date;
}

export interface ReadingProgress {
  articleId: string;
  userId: string;
  scrollPosition: number; // 0-100 percentage
  timeSpent: number; // in seconds
  isCompleted: boolean;
  lastReadAt: Date;
  resumePosition?: {
    scrollY: number;
    webViewUrl?: string;
  };
}

export interface OfflineArticle {
  id: string;
  article: any; // Full article data
  downloadedAt: Date;
  fileSize: number;
  isDownloaded: boolean;
  localPath?: string;
  images?: string[]; // local image paths
}