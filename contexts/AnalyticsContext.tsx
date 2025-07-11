import React, { createContext, useContext, useState } from 'react';
import { UserProfileService } from '../services/userProfileService';
import { OfflinePersonalizationService } from '../services/offlinePersonalizationService';
import { useAuth } from './AuthContext';

interface AnalyticsContextType {
  trackArticleRead: (articleId: string, category: string, source: string, readingTime?: number) => Promise<void>;
  trackArticleSaved: (articleId: string, category: string, source: string) => Promise<void>;
  trackArticleShared: (articleId: string, category: string, source: string) => Promise<void>;
  trackArticleSkipped: (articleId: string, category: string, source: string) => Promise<void>;
  trackSwipeAction: (direction: 'up' | 'down', articleId: string, category: string) => Promise<void>;
  trackTimeSpent: (articleId: string, timeSpent: number) => Promise<void>;
  setOfflineMode: (offline: boolean) => void;
  syncOfflineData: () => Promise<void>;
}

/**
 * AnalyticsContext provides tracking for article interactions, swipes, and offline sync.
 * All methods are robust to offline/online and handle user profile updates.
 */
const AnalyticsContext = createContext<AnalyticsContextType>({
  trackArticleRead: async () => {},
  trackArticleSaved: async () => {},
  trackArticleShared: async () => {},
  trackArticleSkipped: async () => {},
  trackSwipeAction: async () => {},
  trackTimeSpent: async () => {},
  setOfflineMode: () => {},
  syncOfflineData: async () => {},
});

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [isOffline, setIsOffline] = useState(false);

  /**
   * Track when an article is read. Optionally pass readingTime (in minutes).
   */
  const trackArticleRead = async (articleId: string, category: string, source: string, readingTime?: number) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;
      const userProfileService = UserProfileService.getInstance();
      await userProfileService.updateCategoryPreference(userId, category, 'read');
      await userProfileService.updateSourcePreference(userId, source, 'read');
      if (readingTime) {
        await userProfileService.updateBehaviorData(userId, { averageReadingTime: readingTime, totalArticlesRead: 1 });
      } else {
        await userProfileService.updateBehaviorData(userId, { totalArticlesRead: 1 });
      }
    } catch (error) {
      const offlineService = OfflinePersonalizationService.getInstance();
      await offlineService.storeOfflineInteraction({
        type: 'read',
        articleId,
        category,
        sourceId: source
      });
    }
  };

  const trackArticleSaved = async (articleId: string, category: string, source: string) => {
    console.log(`Article saved: ${articleId}, Category: ${category}, Source: ${source}`);
    
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      if (isOffline) {
        const offlineService = OfflinePersonalizationService.getInstance();
        await offlineService.storeOfflineInteraction({
          type: 'save',
          articleId,
          category,
          sourceId: source
        });
        await offlineService.updateOfflineProfile(userId, category, source, 'save');
      } else {
        const userProfileService = UserProfileService.getInstance();
        await userProfileService.updateCategoryPreference(userId, category, 'save');
        await userProfileService.updateSourcePreference(userId, source, 'save');
        await userProfileService.updateBehaviorData(userId, {
          totalArticlesSaved: 1
        });
      }
    } catch (error) {
      console.error('Error tracking article saved:', error);
      const offlineService = OfflinePersonalizationService.getInstance();
      await offlineService.storeOfflineInteraction({
        type: 'save',
        articleId,
        category,
        sourceId: source
      });
    }
  };

  const trackArticleShared = async (articleId: string, category: string, source: string) => {
    console.log(`Article shared: ${articleId}, Category: ${category}, Source: ${source}`);
    
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      if (isOffline) {
        const offlineService = OfflinePersonalizationService.getInstance();
        await offlineService.storeOfflineInteraction({
          type: 'share',
          articleId,
          category,
          sourceId: source
        });
        await offlineService.updateOfflineProfile(userId, category, source, 'share');
      } else {
        const userProfileService = UserProfileService.getInstance();
        await userProfileService.updateCategoryPreference(userId, category, 'share');
        await userProfileService.updateSourcePreference(userId, source, 'share');
        await userProfileService.updateBehaviorData(userId, {
          totalArticlesShared: 1
        });
      }
    } catch (error) {
      console.error('Error tracking article shared:', error);
      const offlineService = OfflinePersonalizationService.getInstance();
      await offlineService.storeOfflineInteraction({
        type: 'share',
        articleId,
        category,
        sourceId: source
      });
    }
  };

  const trackArticleSkipped = async (articleId: string, category: string, source: string) => {
    console.log(`Article skipped: ${articleId}, Category: ${category}, Source: ${source}`);
    
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      if (isOffline) {
        const offlineService = OfflinePersonalizationService.getInstance();
        await offlineService.storeOfflineInteraction({
          type: 'skip',
          articleId,
          category,
          sourceId: source
        });
        await offlineService.updateOfflineProfile(userId, category, source, 'skip');
      } else {
        const userProfileService = UserProfileService.getInstance();
        await userProfileService.updateCategoryPreference(userId, category, 'skip');
        await userProfileService.updateSourcePreference(userId, source, 'skip');
      }
    } catch (error) {
      console.error('Error tracking article skipped:', error);
      const offlineService = OfflinePersonalizationService.getInstance();
      await offlineService.storeOfflineInteraction({
        type: 'skip',
        articleId,
        category,
        sourceId: source
      });
    }
  };

  const trackSwipeAction = async (direction: 'up' | 'down', articleId: string, category: string) => {
    console.log(`Swipe ${direction}: ${articleId}, Category: ${category}`);
    
    const userProfileService = UserProfileService.getInstance();
    const userId = getCurrentUserId();
    
    if (userId) {
      await userProfileService.updateSwipePattern(userId, direction);
    }
  };

  const trackTimeSpent = async (articleId: string, timeSpent: number) => {
    console.log(`Time spent on article ${articleId}: ${timeSpent} seconds`);
    // This could be used for more granular reading time tracking
  };

  const setOfflineMode = (offline: boolean) => {
    setIsOffline(offline);
  };

  const syncOfflineData = async () => {
    try {
      const offlineService = OfflinePersonalizationService.getInstance();
      const userProfileService = UserProfileService.getInstance();
      await offlineService.syncOfflineData(userProfileService);
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  // Helper function to get current user ID
  const getCurrentUserId = (): string | null => {
    // We need to access auth context here, but to avoid circular dependencies,
    // we'll use Firebase auth directly
    try {
      const { getAuth } = require('firebase/auth');
      const auth = getAuth();
      return auth.currentUser?.uid || null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  return (
    <AnalyticsContext.Provider value={{ 
      trackArticleRead, 
      trackArticleSaved, 
      trackArticleShared, 
      trackArticleSkipped,
      trackSwipeAction,
      trackTimeSpent,
      setOfflineMode,
      syncOfflineData
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);
