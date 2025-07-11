import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfileService } from '../services/userProfileService';
import { OfflinePersonalizationService } from '../services/offlinePersonalizationService';
import { useAuth } from './AuthContext';
import { useOffline } from './OfflineContext';

// Enhanced tracking event types
export interface NavigationEvent {
  type: 'navigation';
  screenName: string;
  previousScreen?: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface SearchEvent {
  type: 'search';
  query: string;
  filters?: string[];
  resultsCount?: number;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface SettingsEvent {
  type: 'settings_change';
  settingName: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface PerformanceEvent {
  type: 'performance';
  metric: 'screen_load_time' | 'feed_load_time' | 'search_time';
  value: number; // in milliseconds
  screenName?: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface ErrorEvent {
  type: 'error';
  errorType: string;
  errorMessage: string;
  screenName: string;
  stackTrace?: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface GamificationEvent {
  type: 'gamification';
  action: 'points_earned' | 'badge_unlocked' | 'challenge_completed' | 'leaderboard_viewed';
  points?: number;
  badgeId?: string;
  challengeId?: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface ContentEngagementEvent {
  type: 'content_engagement';
  action: 'scroll_depth' | 'time_on_content' | 'interaction_timing';
  articleId?: string;
  category?: string;
  scrollPercentage?: number;
  timeSpent?: number;
  timeOfDay?: string;
  dayOfWeek?: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface SessionEvent {
  type: 'session';
  action: 'start' | 'end' | 'background' | 'foreground';
  duration?: number; // in seconds
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export type AnalyticsEvent = 
  | NavigationEvent 
  | SearchEvent 
  | SettingsEvent 
  | PerformanceEvent 
  | ErrorEvent 
  | GamificationEvent 
  | ContentEngagementEvent 
  | SessionEvent;

// Privacy settings interface
export interface PrivacySettings {
  trackingEnabled: boolean;
  trackNavigation: boolean;
  trackSearch: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
  trackGamification: boolean;
  trackContentEngagement: boolean;
  dataRetentionDays: number;
  anonymizeData: boolean;
}

interface EnhancedAnalyticsContextType {
  // Original tracking methods (maintained for backward compatibility)
  trackArticleRead: (articleId: string, category: string, source: string, readingTime?: number) => Promise<void>;
  trackArticleSaved: (articleId: string, category: string, source: string) => Promise<void>;
  trackArticleShared: (articleId: string, category: string, source: string) => Promise<void>;
  trackArticleSkipped: (articleId: string, category: string, source: string) => Promise<void>;
  trackSwipeAction: (direction: 'up' | 'down', articleId: string, category: string) => Promise<void>;
  trackTimeSpent: (articleId: string, timeSpent: number) => Promise<void>;
  
  // Enhanced tracking methods
  trackNavigation: (screenName: string, previousScreen?: string) => Promise<void>;
  trackSearch: (query: string, filters?: string[], resultsCount?: number) => Promise<void>;
  trackSettingsChange: (settingName: string, oldValue: any, newValue: any) => Promise<void>;
  trackPerformance: (metric: 'screen_load_time' | 'feed_load_time' | 'search_time', value: number, screenName?: string) => Promise<void>;
  trackError: (errorType: string, errorMessage: string, screenName: string, stackTrace?: string) => Promise<void>;
  trackGamification: (action: 'points_earned' | 'badge_unlocked' | 'challenge_completed' | 'leaderboard_viewed', data?: any) => Promise<void>;
  trackContentEngagement: (action: 'scroll_depth' | 'time_on_content' | 'interaction_timing', data: any) => Promise<void>;
  trackSession: (action: 'start' | 'end' | 'background' | 'foreground', duration?: number) => Promise<void>;
  
  // Privacy and settings
  privacySettings: PrivacySettings;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  exportUserData: () => Promise<any>;
  deleteUserData: () => Promise<void>;
  
  // Session management
  sessionId: string;
  startNewSession: () => void;
  
  // Offline and sync
  setOfflineMode: (offline: boolean) => void;
  syncOfflineData: () => Promise<void>;
  
  // Analytics insights
  getAnalyticsInsights: () => Promise<any>;
}

const defaultPrivacySettings: PrivacySettings = {
  trackingEnabled: true,
  trackNavigation: true,
  trackSearch: true,
  trackPerformance: true,
  trackErrors: true,
  trackGamification: true,
  trackContentEngagement: true,
  dataRetentionDays: 365,
  anonymizeData: false,
};

const EnhancedAnalyticsContext = createContext<EnhancedAnalyticsContextType>({
  // Original methods
  trackArticleRead: async () => {},
  trackArticleSaved: async () => {},
  trackArticleShared: async () => {},
  trackArticleSkipped: async () => {},
  trackSwipeAction: async () => {},
  trackTimeSpent: async () => {},
  
  // Enhanced methods
  trackNavigation: async () => {},
  trackSearch: async () => {},
  trackSettingsChange: async () => {},
  trackPerformance: async () => {},
  trackError: async () => {},
  trackGamification: async () => {},
  trackContentEngagement: async () => {},
  trackSession: async () => {},
  
  // Privacy and settings
  privacySettings: defaultPrivacySettings,
  updatePrivacySettings: async () => {},
  exportUserData: async () => null,
  deleteUserData: async () => {},
  
  // Session management
  sessionId: '',
  startNewSession: () => {},
  
  // Offline and sync
  setOfflineMode: () => {},
  syncOfflineData: async () => {},
  
  // Analytics insights
  getAnalyticsInsights: async () => null,
});

export const EnhancedAnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { isOffline } = useOffline();
  const [sessionId, setSessionId] = useState<string>('');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [currentScreen, setCurrentScreen] = useState<string>('');

  // Generate unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialize session
  useEffect(() => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setSessionStartTime(new Date());
    
    // Load privacy settings from storage
    loadPrivacySettings();
    
    // Track session start
    trackSession('start');
    
    return () => {
      // Track session end on cleanup
      trackSession('end', Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000));
    };
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const userProfileService = UserProfileService.getInstance();
      const userId = getCurrentUserId();
      if (userId) {
        const profile = await userProfileService.getUserProfile(userId);
        if (profile?.privacySettings) {
          setPrivacySettings({ ...defaultPrivacySettings, ...profile.privacySettings });
        }
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const getCurrentUserId = (): string | null => {
    return user?.id || null;
  };

  const shouldTrack = (trackingType: keyof PrivacySettings): boolean => {
    return privacySettings.trackingEnabled && privacySettings[trackingType] === true;
  };

  const storeEvent = async (event: AnalyticsEvent) => {
    try {
      if (!shouldTrack('trackingEnabled')) return;

      const userProfileService = UserProfileService.getInstance();
      const offlineService = OfflinePersonalizationService.getInstance();

      if (isOffline) {
        // Store offline for later sync
        await offlineService.storeOfflineAnalyticsEvent(event);
      } else {
        // Store directly
        await userProfileService.storeAnalyticsEvent(event);
      }
    } catch (error) {
      console.error('Error storing analytics event:', error);
      // Fallback to offline storage
      try {
        const offlineService = OfflinePersonalizationService.getInstance();
        await offlineService.storeOfflineAnalyticsEvent(event);
      } catch (offlineError) {
        console.error('Error storing offline analytics event:', offlineError);
      }
    }
  };

  // Original tracking methods (enhanced)
  const trackArticleRead = async (articleId: string, category: string, source: string, readingTime?: number) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      const userProfileService = UserProfileService.getInstance();
      await userProfileService.updateCategoryPreference(userId, category, 'read');
      await userProfileService.updateSourcePreference(userId, source, 'read');
      
      if (readingTime !== undefined) {
        await userProfileService.updateBehaviorData(userId, { 
          averageReadingTime: readingTime, 
          totalArticlesRead: 1 
        });
      } else {
        await userProfileService.updateBehaviorData(userId, { totalArticlesRead: 1 });
      }

      // Enhanced tracking
      await trackContentEngagement('time_on_content', {
        articleId,
        category,
        timeSpent: readingTime,
        timeOfDay: new Date().getHours().toString(),
        dayOfWeek: new Date().getDay().toString(),
      });

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
    const userProfileService = UserProfileService.getInstance();
    const userId = getCurrentUserId();
    
    if (userId) {
      await userProfileService.updateSwipePattern(userId, direction);
    }
  };

  const trackTimeSpent = async (articleId: string, timeSpent: number) => {
    await trackContentEngagement('time_on_content', {
      articleId,
      timeSpent,
      timeOfDay: new Date().getHours().toString(),
      dayOfWeek: new Date().getDay().toString(),
    });
  };

  // Enhanced tracking methods
  const trackNavigation = async (screenName: string, previousScreen?: string) => {
    if (!shouldTrack('trackNavigation')) return;

    const event: NavigationEvent = {
      type: 'navigation',
      screenName,
      previousScreen: previousScreen || currentScreen,
      timestamp: new Date(),
      sessionId,
      userId: getCurrentUserId() || undefined,
    };

    setCurrentScreen(screenName);
    await storeEvent(event);
  };

  const trackSearch = async (query: string, filters?: string[], resultsCount?: number) => {
    if (!shouldTrack('trackSearch')) return;

    const event: SearchEvent = {
      type: 'search',
      query: privacySettings.anonymizeData ? 'ANONYMIZED' : query,
      filters,
      resultsCount,
      timestamp: new Date(),
      sessionId,
      userId: getCurrentUserId() || undefined,
    };

    await storeEvent(event);
  };

  const trackSettingsChange = async (settingName: string, oldValue: any, newValue: any) => {
    const event: SettingsEvent = {
      type: 'settings_change',
      settingName,
      oldValue,
      newValue,
      timestamp: new Date(),
      sessionId,
      userId: getCurrentUserId() || undefined,
    };

    await storeEvent(event);
  };

  const trackPerformance = async (
    metric: 'screen_load_time' | 'feed_load_time' | 'search_time',
    value: number,
    screenName?: string
  ) => {
    if (!shouldTrack('trackPerformance')) return;

    const event: PerformanceEvent = {
      type: 'performance',
      metric,
      value,
      screenName,
      timestamp: new Date(),
      sessionId,
      userId: getCurrentUserId() || undefined,
    };

    await storeEvent(event);
  };

  const trackError = async (
    errorType: string,
    errorMessage: string,
    screenName: string,
    stackTrace?: string
  ) => {
    if (!shouldTrack('trackErrors')) return;

    const event: ErrorEvent = {
      type: 'error',
      errorType,
      errorMessage: privacySettings.anonymizeData ? 'ANONYMIZED_ERROR' : errorMessage,
      screenName,
      stackTrace: privacySettings.anonymizeData ? undefined : stackTrace,
      timestamp: new Date(),
      sessionId,
      userId: getCurrentUserId() || undefined,
    };

    await storeEvent(event);
  };

  const trackGamification = async (
    action: 'points_earned' | 'badge_unlocked' | 'challenge_completed' | 'leaderboard_viewed',
    data?: any
  ) => {
    if (!shouldTrack('trackGamification')) return;

    const event: GamificationEvent = {
      type: 'gamification',
      action,
      ...data,
      timestamp: new Date(),
      sessionId,
      userId: getCurrentUserId() || undefined,
    };

    await storeEvent(event);
  };

  const trackContentEngagement = async (
    action: 'scroll_depth' | 'time_on_content' | 'interaction_timing',
    data: any
  ) => {
    if (!shouldTrack('trackContentEngagement')) return;

    const event: ContentEngagementEvent = {
      type: 'content_engagement',
      action,
      ...data,
      timestamp: new Date(),
      sessionId,
      userId: getCurrentUserId() || undefined,
    };

    await storeEvent(event);
  };

  const trackSession = async (action: 'start' | 'end' | 'background' | 'foreground', duration?: number) => {
    const event: SessionEvent = {
      type: 'session',
      action,
      duration,
      timestamp: new Date(),
      sessionId,
      userId: getCurrentUserId() || undefined,
    };

    await storeEvent(event);
  };

  // Privacy and settings methods
  const updatePrivacySettings = async (settings: Partial<PrivacySettings>) => {
    const newSettings = { ...privacySettings, ...settings };
    setPrivacySettings(newSettings);

    try {
      const userProfileService = UserProfileService.getInstance();
      const userId = getCurrentUserId();
      if (userId) {
        await userProfileService.updatePrivacySettings(userId, newSettings);
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  const exportUserData = async () => {
    try {
      const userProfileService = UserProfileService.getInstance();
      const userId = getCurrentUserId();
      if (!userId) return null;

      return await userProfileService.exportUserData(userId);
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  };

  const deleteUserData = async () => {
    try {
      const userProfileService = UserProfileService.getInstance();
      const userId = getCurrentUserId();
      if (!userId) return;

      await userProfileService.deleteUserData(userId);
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  };

  const startNewSession = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setSessionStartTime(new Date());
    trackSession('start');
  };

  const setOfflineMode = (offline: boolean) => {
    // This will be handled by the OfflineContext
  };

  const syncOfflineData = async () => {
    try {
      const offlineService = OfflinePersonalizationService.getInstance();
      const userProfileService = UserProfileService.getInstance();
      await offlineService.syncOfflineData(userProfileService);
      await offlineService.syncOfflineAnalyticsEvents(userProfileService);
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  const getAnalyticsInsights = async () => {
    try {
      const userProfileService = UserProfileService.getInstance();
      const userId = getCurrentUserId();
      if (!userId) return null;

      return await userProfileService.getAnalyticsInsights(userId);
    } catch (error) {
      console.error('Error getting analytics insights:', error);
      return null;
    }
  };

  return (
    <EnhancedAnalyticsContext.Provider value={{
      // Original methods
      trackArticleRead,
      trackArticleSaved,
      trackArticleShared,
      trackArticleSkipped,
      trackSwipeAction,
      trackTimeSpent,
      
      // Enhanced methods
      trackNavigation,
      trackSearch,
      trackSettingsChange,
      trackPerformance,
      trackError,
      trackGamification,
      trackContentEngagement,
      trackSession,
      
      // Privacy and settings
      privacySettings,
      updatePrivacySettings,
      exportUserData,
      deleteUserData,
      
      // Session management
      sessionId,
      startNewSession,
      
      // Offline and sync
      setOfflineMode,
      syncOfflineData,
      
      // Analytics insights
      getAnalyticsInsights,
    }}>
      {children}
    </EnhancedAnalyticsContext.Provider>
  );
};

export const useEnhancedAnalytics = () => useContext(EnhancedAnalyticsContext);