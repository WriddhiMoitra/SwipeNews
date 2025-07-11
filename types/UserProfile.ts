export interface CategoryPreference {
  category: string;
  weight: number; // 0-1 scale, higher means more preferred
  interactionCount: number;
  lastInteraction: Date;
}

export interface SourcePreference {
  sourceId: string;
  weight: number; // 0-1 scale
  interactionCount: number;
  lastInteraction: Date;
}

export interface UserBehaviorData {
  totalArticlesRead: number;
  totalArticlesSaved: number;
  totalArticlesShared: number;
  averageReadingTime: number; // in minutes
  preferredReadingTimes: number[]; // hours of day (0-23)
  swipePatterns: {
    upSwipes: number; // save for later
    downSwipes: number; // next article
  };
  // Gamification data
  totalPoints: number;
  level: number;
  weeklyPoints: number;
  monthlyPoints: number;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: Date;
  // Reading progress
  articlesInProgress: { [articleId: string]: number }; // scroll positions
}

export interface UserProfile {
  userId: string;
  language: string;
  region: string;
  categoryPreferences: CategoryPreference[];
  sourcePreferences: SourcePreference[];
  behaviorData: UserBehaviorData;
  createdAt: Date;
  updatedAt: Date;
  version: number; // for profile schema versioning
}

export interface PersonalizationConfig {
  categoryWeightDecay: number; // how fast preferences decay over time
  minInteractionsForPreference: number; // minimum interactions to establish preference
  diversityFactor: number; // 0-1, how much to prioritize diversity vs relevance
  recencyBoost: number; // boost factor for recent articles
  maxArticlesPerCategory: number; // max articles from same category in feed
}

export interface ArticleScore {
  articleId: string;
  relevanceScore: number; // 0-1 based on user preferences
  diversityScore: number; // 0-1 based on feed diversity
  recencyScore: number; // 0-1 based on article age
  finalScore: number; // weighted combination of above
  reasons: string[]; // explanation for scoring
}