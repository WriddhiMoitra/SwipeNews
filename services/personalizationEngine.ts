import { Article } from '../types/Article';
import { UserProfile, ArticleScore, PersonalizationConfig } from '../types/UserProfile';
import { UserProfileService } from './userProfileService';

export class PersonalizationEngine {
  private static instance: PersonalizationEngine;
  private config: PersonalizationConfig;

  constructor() {
    this.config = {
      categoryWeightDecay: 0.95,
      minInteractionsForPreference: 3,
      diversityFactor: 0.3, // 30% weight for diversity
      recencyBoost: 0.2, // 20% boost for recent articles
      maxArticlesPerCategory: 3
    };
  }

  static getInstance(): PersonalizationEngine {
    if (!PersonalizationEngine.instance) {
      PersonalizationEngine.instance = new PersonalizationEngine();
    }
    return PersonalizationEngine.instance;
  }

  async scoreArticles(articles: Article[], userId: string): Promise<ArticleScore[]> {
    const userProfileService = UserProfileService.getInstance();
    const userProfile = await userProfileService.getUserProfile(userId);

    const scoredArticles = articles.map(article => this.scoreArticle(article, userProfile));
    
    // Apply diversity constraints
    return this.applyDiversityConstraints(scoredArticles);
  }

  private scoreArticle(article: Article, userProfile: UserProfile): ArticleScore {
    const relevanceScore = this.calculateRelevanceScore(article, userProfile);
    const recencyScore = this.calculateRecencyScore(article);
    const diversityScore = this.calculateDiversityScore(article, userProfile);

    // Weighted combination
    const finalScore = 
      (relevanceScore * (1 - this.config.diversityFactor)) +
      (diversityScore * this.config.diversityFactor) +
      (recencyScore * this.config.recencyBoost);

    const reasons = this.generateScoringReasons(article, userProfile, relevanceScore, diversityScore, recencyScore);

    return {
      articleId: article.id,
      relevanceScore,
      diversityScore,
      recencyScore,
      finalScore: Math.min(1, finalScore), // cap at 1.0
      reasons
    };
  }

  private calculateRelevanceScore(article: Article, userProfile: UserProfile): number {
    let score = 0.5; // base score
    const reasons: string[] = [];

    // Category preference
    const categoryPref = userProfile.categoryPreferences.find(cp => cp.category === article.category);
    if (categoryPref && categoryPref.interactionCount >= this.config.minInteractionsForPreference) {
      score = categoryPref.weight;
      reasons.push(`Category preference: ${article.category} (${categoryPref.weight.toFixed(2)})`);
    }

    // Source preference
    const sourcePref = userProfile.sourcePreferences.find(sp => sp.sourceId === article.source_id);
    if (sourcePref && sourcePref.interactionCount >= this.config.minInteractionsForPreference) {
      score = (score + sourcePref.weight) / 2; // average with category score
      reasons.push(`Source preference: ${article.source_id} (${sourcePref.weight.toFixed(2)})`);
    }

    // Language and region match
    if (article.language === userProfile.language) {
      score += 0.1;
      reasons.push('Language match');
    }
    if (article.country === userProfile.region) {
      score += 0.1;
      reasons.push('Region match');
    }

    // Time-based preferences
    const currentHour = new Date().getHours();
    if (userProfile.behaviorData.preferredReadingTimes.includes(currentHour)) {
      score += 0.05;
      reasons.push('Preferred reading time');
    }

    return Math.min(1, score);
  }

  private calculateRecencyScore(article: Article): number {
    const now = new Date();
    const articleAge = now.getTime() - article.published_at.getTime();
    const hoursOld = articleAge / (1000 * 60 * 60);

    // Score decreases with age, but not linearly
    if (hoursOld < 1) return 1.0; // Very recent
    if (hoursOld < 6) return 0.9; // Recent
    if (hoursOld < 24) return 0.7; // Today
    if (hoursOld < 72) return 0.5; // Last 3 days
    if (hoursOld < 168) return 0.3; // Last week
    return 0.1; // Older than a week
  }

  private calculateDiversityScore(article: Article, userProfile: UserProfile): number {
    // Higher score for categories user hasn't interacted with much
    const categoryPref = userProfile.categoryPreferences.find(cp => cp.category === article.category);
    
    if (!categoryPref || categoryPref.interactionCount < this.config.minInteractionsForPreference) {
      return 0.8; // High diversity score for unexplored categories
    }

    // Lower diversity score for heavily consumed categories
    const normalizedInteractions = Math.min(1, categoryPref.interactionCount / 20); // normalize to 0-1
    return 1 - normalizedInteractions;
  }

  private applyDiversityConstraints(scoredArticles: ArticleScore[]): ArticleScore[] {
    // Sort by final score
    const sorted = scoredArticles.sort((a, b) => b.finalScore - a.finalScore);
    
    // Track category counts
    const categoryCount: { [key: string]: number } = {};
    const result: ArticleScore[] = [];

    for (const scoredArticle of sorted) {
      // Find the original article to get category
      const article = scoredArticles.find(sa => sa.articleId === scoredArticle.articleId);
      if (!article) continue;

      // Get category from the article (we need to pass this info somehow)
      // For now, we'll assume we can get it from the scored article
      // In a real implementation, we'd need to pass the original articles too
      
      result.push(scoredArticle);
    }

    return result;
  }

  private generateScoringReasons(
    article: Article, 
    userProfile: UserProfile, 
    relevanceScore: number, 
    diversityScore: number, 
    recencyScore: number
  ): string[] {
    const reasons: string[] = [];

    if (relevanceScore > 0.7) {
      reasons.push('High relevance to your interests');
    } else if (relevanceScore < 0.3) {
      reasons.push('Low relevance to your interests');
    }

    if (diversityScore > 0.7) {
      reasons.push('Adds diversity to your feed');
    }

    if (recencyScore > 0.8) {
      reasons.push('Breaking news');
    } else if (recencyScore > 0.6) {
      reasons.push('Recent news');
    }

    const categoryPref = userProfile.categoryPreferences.find(cp => cp.category === article.category);
    if (categoryPref && categoryPref.weight > 0.7) {
      reasons.push(`You often read ${article.category} articles`);
    }

    return reasons;
  }

  // Method to get personalized articles with fallback for new users
  async getPersonalizedFeed(
    articles: Article[], 
    userId: string, 
    fallbackArticles: Article[]
  ): Promise<Article[]> {
    const userProfileService = UserProfileService.getInstance();
    const userProfile = await userProfileService.getUserProfile(userId);

    // For new users with minimal interaction data, use a balanced approach
    if (userProfile.behaviorData.totalArticlesRead < 10) {
      return this.getBalancedFeedForNewUser(articles, userProfile);
    }

    // For experienced users, use full personalization
    const scoredArticles = await this.scoreArticles(articles, userId);
    const sortedByScore = scoredArticles.sort((a, b) => b.finalScore - a.finalScore);

    // Map back to articles
    const personalizedArticles: Article[] = [];
    for (const scored of sortedByScore) {
      const article = articles.find(a => a.id === scored.articleId);
      if (article) {
        personalizedArticles.push(article);
      }
    }

    return personalizedArticles;
  }

  private getBalancedFeedForNewUser(articles: Article[], userProfile: UserProfile): Article[] {
    // For new users, provide a balanced mix across categories
    const categorizedArticles: { [key: string]: Article[] } = {};
    
    // Group articles by category
    articles.forEach(article => {
      if (!categorizedArticles[article.category]) {
        categorizedArticles[article.category] = [];
      }
      categorizedArticles[article.category].push(article);
    });

    // Take recent articles from each category
    const balancedFeed: Article[] = [];
    const categories = Object.keys(categorizedArticles);
    
    // Sort categories to prioritize general news for new users
    const priorityCategories = ['general', 'national', 'world', 'business', 'technology'];
    const sortedCategories = [
      ...priorityCategories.filter(cat => categories.includes(cat)),
      ...categories.filter(cat => !priorityCategories.includes(cat))
    ];

    // Take 2-3 articles from each category, prioritizing recent ones
    sortedCategories.forEach(category => {
      const categoryArticles = categorizedArticles[category]
        .sort((a, b) => b.published_at.getTime() - a.published_at.getTime())
        .slice(0, 3);
      balancedFeed.push(...categoryArticles);
    });

    // Sort final feed by recency
    return balancedFeed.sort((a, b) => b.published_at.getTime() - a.published_at.getTime());
  }

  updateConfig(newConfig: Partial<PersonalizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): PersonalizationConfig {
    return { ...this.config };
  }
}