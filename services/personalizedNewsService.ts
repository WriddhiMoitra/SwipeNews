import { Article } from '../types/Article';
import { fetchArticles } from './newsService';
import { PersonalizationEngine } from './personalizationEngine';
import { UserProfileService } from './userProfileService';

export class PersonalizedNewsService {
  private static instance: PersonalizedNewsService;
  private personalizationEngine: PersonalizationEngine;
  private userProfileService: UserProfileService;

  constructor() {
    this.personalizationEngine = PersonalizationEngine.getInstance();
    this.userProfileService = UserProfileService.getInstance();
  }

  static getInstance(): PersonalizedNewsService {
    if (!PersonalizedNewsService.instance) {
      PersonalizedNewsService.instance = new PersonalizedNewsService();
    }
    return PersonalizedNewsService.instance;
  }

  /**
   * Fetch personalized articles for a user
   * @param userId - User ID
   * @param language - User's preferred language
   * @param country - User's preferred country/region
   * @param category - Optional category filter
   * @param limit - Maximum number of articles to return
   * @returns Promise resolving to personalized articles
   */
  async fetchPersonalizedArticles(
    userId: string,
    language: string = 'en',
    country: string = 'india',
    category?: string,
    limit: number = 50
  ): Promise<Article[]> {
    try {
      // Get user profile to understand preferences
      const userProfile = await this.userProfileService.getUserProfile(userId);

      // Fetch base articles from the database
      let baseArticles: Article[] = [];

      if (category) {
        // If specific category requested, fetch that
        baseArticles = await fetchArticles(language, country, category);
      } else {
        // For personalized feed, fetch from multiple categories
        const preferredCategories = this.userProfileService.getTopCategories(userProfile, 5);
        const diversityCategories = this.userProfileService.getDiversityCategories(userProfile, 3);
        
        // Combine preferred and diversity categories
        const categoriesToFetch = [...new Set([...preferredCategories, ...diversityCategories])];
        
        // If user is new or has no preferences, fetch from all major categories
        if (categoriesToFetch.length === 0) {
          categoriesToFetch.push('general', 'business', 'technology', 'sports', 'entertainment');
        }

        // Fetch articles from each category
        const articlePromises = categoriesToFetch.map(cat => 
          fetchArticles(language, country, cat)
        );
        
        const categoryArticles = await Promise.all(articlePromises);
        baseArticles = categoryArticles.flat();

        // Also fetch some general articles for diversity
        const generalArticles = await fetchArticles(language, country, 'general');
        baseArticles = [...baseArticles, ...generalArticles];

        // Remove duplicates
        baseArticles = this.removeDuplicateArticles(baseArticles);
      }

      // Apply personalization
      const personalizedArticles = await this.personalizationEngine.getPersonalizedFeed(
        baseArticles,
        userId,
        baseArticles // fallback articles are the same for now
      );

      // Limit results
      return personalizedArticles.slice(0, limit);

    } catch (error) {
      console.error('Error fetching personalized articles:', error);
      
      // Fallback to regular articles if personalization fails
      return await fetchArticles(language, country, category);
    }
  }

  /**
   * Get articles for a new user with balanced content
   */
  async fetchBalancedFeedForNewUser(
    language: string = 'en',
    country: string = 'india',
    limit: number = 30
  ): Promise<Article[]> {
    try {
      const categories = ['general', 'business', 'technology', 'sports', 'entertainment', 'health'];
      const articlesPerCategory = Math.ceil(limit / categories.length);

      const articlePromises = categories.map(category => 
        fetchArticles(language, country, category)
          .then(articles => articles.slice(0, articlesPerCategory))
      );

      const categoryArticles = await Promise.all(articlePromises);
      const allArticles = categoryArticles.flat();

      // Sort by recency and return limited results
      return allArticles
        .sort((a, b) => b.published_at.getTime() - a.published_at.getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching balanced feed:', error);
      return await fetchArticles(language, country);
    }
  }

  /**
   * Get trending articles based on engagement
   */
  async fetchTrendingArticles(
    language: string = 'en',
    country: string = 'india',
    limit: number = 20
  ): Promise<Article[]> {
    try {
      // Fetch recent articles from popular categories
      const trendingCategories = ['general', 'business', 'technology', 'sports'];
      
      const articlePromises = trendingCategories.map(category => 
        fetchArticles(language, country, category)
      );

      const categoryArticles = await Promise.all(articlePromises);
      const allArticles = categoryArticles.flat();

      // Sort by engagement score (if available) and recency
      return allArticles
        .sort((a, b) => {
          // Primary sort by engagement score
          const engagementDiff = (b.engagementScore || 0) - (a.engagementScore || 0);
          if (engagementDiff !== 0) return engagementDiff;
          
          // Secondary sort by recency
          return b.published_at.getTime() - a.published_at.getTime();
        })
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching trending articles:', error);
      return await fetchArticles(language, country);
    }
  }

  /**
   * Get articles similar to a given article (for "more like this" feature)
   */
  async fetchSimilarArticles(
    baseArticle: Article,
    userId: string,
    limit: number = 10
  ): Promise<Article[]> {
    try {
      // Fetch articles from the same category
      const similarArticles = await fetchArticles(
        baseArticle.language,
        baseArticle.country,
        baseArticle.category
      );

      // Filter out the base article
      const filteredArticles = similarArticles.filter(article => article.id !== baseArticle.id);

      // Apply light personalization
      const personalizedSimilar = await this.personalizationEngine.getPersonalizedFeed(
        filteredArticles,
        userId,
        filteredArticles
      );

      return personalizedSimilar.slice(0, limit);

    } catch (error) {
      console.error('Error fetching similar articles:', error);
      return [];
    }
  }

  /**
   * Remove duplicate articles based on title similarity
   */
  private removeDuplicateArticles(articles: Article[]): Article[] {
    const seen = new Set<string>();
    const uniqueArticles: Article[] = [];

    for (const article of articles) {
      // Create a normalized title for comparison
      const normalizedTitle = article.title.toLowerCase().trim();
      
      if (!seen.has(normalizedTitle)) {
        seen.add(normalizedTitle);
        uniqueArticles.push(article);
      }
    }

    return uniqueArticles;
  }

  /**
   * Update personalization config
   */
  updatePersonalizationConfig(config: any): void {
    this.personalizationEngine.updateConfig(config);
  }

  /**
   * Get user's reading statistics
   */
  async getUserReadingStats(userId: string): Promise<any> {
    try {
      const userProfile = await this.userProfileService.getUserProfile(userId);
      
      return {
        totalArticlesRead: userProfile.behaviorData.totalArticlesRead,
        totalArticlesSaved: userProfile.behaviorData.totalArticlesSaved,
        totalArticlesShared: userProfile.behaviorData.totalArticlesShared,
        averageReadingTime: userProfile.behaviorData.averageReadingTime,
        topCategories: this.userProfileService.getTopCategories(userProfile, 5),
        preferredReadingTimes: userProfile.behaviorData.preferredReadingTimes,
        swipePatterns: userProfile.behaviorData.swipePatterns
      };
    } catch (error) {
      console.error('Error getting user reading stats:', error);
      return null;
    }
  }
}