import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { UserProfile, PersonalizationConfig } from '../types/UserProfile';
import { AnalyticsEvent, PrivacySettings } from '../contexts/EnhancedAnalyticsContext';

export class EnhancedUserProfileService {
  private static instance: EnhancedUserProfileService;

  static getInstance(): EnhancedUserProfileService {
    if (!EnhancedUserProfileService.instance) {
      EnhancedUserProfileService.instance = new EnhancedUserProfileService();
    }
    return EnhancedUserProfileService.instance;
  }

  // Store analytics events
  async storeAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const eventsCollection = collection(db, 'analyticsEvents');
      await addDoc(eventsCollection, {
        ...event,
        timestamp: event.timestamp.toISOString(),
      });
    } catch (error) {
      console.error('Error storing analytics event:', error);
      throw error;
    }
  }

  // Update privacy settings
  async updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<void> {
    try {
      const userDoc = doc(db, 'userProfiles', userId);
      await updateDoc(userDoc, {
        privacySettings: settings,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  // Export all user data
  async exportUserData(userId: string): Promise<any> {
    try {
      const userData: any = {};

      // Get user profile
      const userDoc = doc(db, 'userProfiles', userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        userData.profile = userSnapshot.data();
      }

      // Get analytics events
      const eventsQuery = query(
        collection(db, 'analyticsEvents'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      userData.analyticsEvents = eventsSnapshot.docs.map(doc => doc.data());

      // Get preferences
      const preferencesDoc = doc(db, 'userPreferences', userId);
      const preferencesSnapshot = await getDoc(preferencesDoc);
      if (preferencesSnapshot.exists()) {
        userData.preferences = preferencesSnapshot.data();
      }

      return userData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Delete all user data
  async deleteUserData(userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete user profile
      const userDoc = doc(db, 'userProfiles', userId);
      batch.delete(userDoc);

      // Delete user preferences
      const preferencesDoc = doc(db, 'userPreferences', userId);
      batch.delete(preferencesDoc);

      // Delete analytics events (in batches due to Firestore limitations)
      const eventsQuery = query(
        collection(db, 'analyticsEvents'),
        where('userId', '==', userId),
        limit(500)
      );
      
      let eventsSnapshot = await getDocs(eventsQuery);
      while (!eventsSnapshot.empty) {
        eventsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        eventsSnapshot = await getDocs(eventsQuery);
      }

      await batch.commit();
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  // Get analytics insights
  async getAnalyticsInsights(userId: string): Promise<any> {
    try {
      const insights: any = {
        navigation: {},
        content: {},
        performance: {},
        engagement: {},
        sessions: {},
      };

      // Get recent analytics events (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const eventsQuery = query(
        collection(db, 'analyticsEvents'),
        where('userId', '==', userId),
        where('timestamp', '>=', thirtyDaysAgo.toISOString()),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => doc.data());

      // Process navigation insights
      const navigationEvents = events.filter(e => e.type === 'navigation');
      insights.navigation = {
        totalScreenViews: navigationEvents.length,
        mostVisitedScreens: this.getMostFrequent(navigationEvents.map(e => e.screenName)),
        averageSessionScreens: this.calculateAverageScreensPerSession(navigationEvents),
        navigationFlow: this.calculateNavigationFlow(navigationEvents),
      };

      // Process content engagement insights
      const contentEvents = events.filter(e => e.type === 'content_engagement');
      insights.content = {
        totalEngagements: contentEvents.length,
        averageTimeOnContent: this.calculateAverageTimeOnContent(contentEvents),
        mostEngagedCategories: this.getMostEngagedCategories(contentEvents),
        readingPatterns: this.calculateReadingPatterns(contentEvents),
      };

      // Process performance insights
      const performanceEvents = events.filter(e => e.type === 'performance');
      insights.performance = {
        averageLoadTimes: this.calculateAverageLoadTimes(performanceEvents),
        slowestScreens: this.getSlowestScreens(performanceEvents),
        performanceTrends: this.calculatePerformanceTrends(performanceEvents),
      };

      // Process session insights
      const sessionEvents = events.filter(e => e.type === 'session');
      insights.sessions = {
        totalSessions: this.countUniqueSessions(sessionEvents),
        averageSessionDuration: this.calculateAverageSessionDuration(sessionEvents),
        sessionTrends: this.calculateSessionTrends(sessionEvents),
      };

      // Process search insights
      const searchEvents = events.filter(e => e.type === 'search');
      insights.search = {
        totalSearches: searchEvents.length,
        topSearchTerms: this.getMostFrequent(searchEvents.map(e => e.query).filter(q => q !== 'ANONYMIZED')),
        searchSuccessRate: this.calculateSearchSuccessRate(searchEvents),
      };

      return insights;
    } catch (error) {
      console.error('Error getting analytics insights:', error);
      throw error;
    }
  }

  // Helper methods for analytics processing
  private getMostFrequent(items: string[]): { [key: string]: number } {
    const frequency: { [key: string]: number } = {};
    items.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    return frequency;
  }

  private calculateAverageScreensPerSession(navigationEvents: any[]): number {
    const sessionScreenCounts: { [sessionId: string]: number } = {};
    navigationEvents.forEach(event => {
      sessionScreenCounts[event.sessionId] = (sessionScreenCounts[event.sessionId] || 0) + 1;
    });
    
    const counts = Object.values(sessionScreenCounts);
    return counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
  }

  private calculateNavigationFlow(navigationEvents: any[]): any[] {
    const flow: any[] = [];
    const sortedEvents = navigationEvents.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (let i = 1; i < sortedEvents.length; i++) {
      const prev = sortedEvents[i - 1];
      const curr = sortedEvents[i];
      if (prev.sessionId === curr.sessionId) {
        flow.push({
          from: prev.screenName,
          to: curr.screenName,
          timestamp: curr.timestamp,
        });
      }
    }

    return flow;
  }

  private calculateAverageTimeOnContent(contentEvents: any[]): number {
    const timeEvents = contentEvents.filter(e => e.action === 'time_on_content' && e.timeSpent);
    if (timeEvents.length === 0) return 0;
    
    const totalTime = timeEvents.reduce((sum, event) => sum + (event.timeSpent || 0), 0);
    return totalTime / timeEvents.length;
  }

  private getMostEngagedCategories(contentEvents: any[]): { [category: string]: number } {
    const categoryEngagement: { [category: string]: number } = {};
    contentEvents.forEach(event => {
      if (event.category) {
        categoryEngagement[event.category] = (categoryEngagement[event.category] || 0) + 1;
      }
    });
    return categoryEngagement;
  }

  private calculateReadingPatterns(contentEvents: any[]): any {
    const patterns = {
      byTimeOfDay: {} as { [hour: string]: number },
      byDayOfWeek: {} as { [day: string]: number },
    };

    contentEvents.forEach(event => {
      if (event.timeOfDay) {
        patterns.byTimeOfDay[event.timeOfDay] = (patterns.byTimeOfDay[event.timeOfDay] || 0) + 1;
      }
      if (event.dayOfWeek) {
        patterns.byDayOfWeek[event.dayOfWeek] = (patterns.byDayOfWeek[event.dayOfWeek] || 0) + 1;
      }
    });

    return patterns;
  }

  private calculateAverageLoadTimes(performanceEvents: any[]): { [metric: string]: number } {
    const loadTimes: { [metric: string]: number[] } = {};
    
    performanceEvents.forEach(event => {
      if (!loadTimes[event.metric]) {
        loadTimes[event.metric] = [];
      }
      loadTimes[event.metric].push(event.value);
    });

    const averages: { [metric: string]: number } = {};
    Object.keys(loadTimes).forEach(metric => {
      const times = loadTimes[metric];
      averages[metric] = times.reduce((a, b) => a + b, 0) / times.length;
    });

    return averages;
  }

  private getSlowestScreens(performanceEvents: any[]): { [screen: string]: number } {
    const screenTimes: { [screen: string]: number[] } = {};
    
    performanceEvents.forEach(event => {
      if (event.screenName && event.metric === 'screen_load_time') {
        if (!screenTimes[event.screenName]) {
          screenTimes[event.screenName] = [];
        }
        screenTimes[event.screenName].push(event.value);
      }
    });

    const averages: { [screen: string]: number } = {};
    Object.keys(screenTimes).forEach(screen => {
      const times = screenTimes[screen];
      averages[screen] = times.reduce((a, b) => a + b, 0) / times.length;
    });

    return averages;
  }

  private calculatePerformanceTrends(performanceEvents: any[]): any[] {
    // Group by day and calculate daily averages
    const dailyPerformance: { [date: string]: { values: number[], count: number } } = {};
    
    performanceEvents.forEach(event => {
      const date = new Date(event.timestamp).toDateString();
      if (!dailyPerformance[date]) {
        dailyPerformance[date] = { values: [], count: 0 };
      }
      dailyPerformance[date].values.push(event.value);
      dailyPerformance[date].count++;
    });

    return Object.keys(dailyPerformance).map(date => ({
      date,
      averageLoadTime: dailyPerformance[date].values.reduce((a, b) => a + b, 0) / dailyPerformance[date].values.length,
      eventCount: dailyPerformance[date].count,
    }));
  }

  private countUniqueSessions(sessionEvents: any[]): number {
    const uniqueSessions = new Set(sessionEvents.map(e => e.sessionId));
    return uniqueSessions.size;
  }

  private calculateAverageSessionDuration(sessionEvents: any[]): number {
    const sessionDurations: { [sessionId: string]: number } = {};
    
    sessionEvents.forEach(event => {
      if (event.action === 'end' && event.duration) {
        sessionDurations[event.sessionId] = event.duration;
      }
    });

    const durations = Object.values(sessionDurations);
    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  }

  private calculateSessionTrends(sessionEvents: any[]): any[] {
    // Group by day and count sessions
    const dailySessions: { [date: string]: Set<string> } = {};
    
    sessionEvents.forEach(event => {
      const date = new Date(event.timestamp).toDateString();
      if (!dailySessions[date]) {
        dailySessions[date] = new Set();
      }
      dailySessions[date].add(event.sessionId);
    });

    return Object.keys(dailySessions).map(date => ({
      date,
      sessionCount: dailySessions[date].size,
    }));
  }

  private calculateSearchSuccessRate(searchEvents: any[]): number {
    if (searchEvents.length === 0) return 0;
    
    const successfulSearches = searchEvents.filter(e => e.resultsCount && e.resultsCount > 0);
    return (successfulSearches.length / searchEvents.length) * 100;
  }
}