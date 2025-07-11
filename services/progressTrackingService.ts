import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingProgress } from '../types/Gamification';

const PROGRESS_KEY = 'reading_progress';

export class ProgressTrackingService {
  private static instance: ProgressTrackingService;

  static getInstance(): ProgressTrackingService {
    if (!ProgressTrackingService.instance) {
      ProgressTrackingService.instance = new ProgressTrackingService();
    }
    return ProgressTrackingService.instance;
  }

  async saveProgress(progress: ReadingProgress): Promise<void> {
    try {
      const key = `${PROGRESS_KEY}_${progress.userId}_${progress.articleId}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        ...progress,
        lastReadAt: progress.lastReadAt.toISOString()
      }));
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  }

  async getProgress(userId: string, articleId: string): Promise<ReadingProgress | null> {
    try {
      const key = `${PROGRESS_KEY}_${userId}_${articleId}`;
      const stored = await AsyncStorage.getItem(key);
      
      if (stored) {
        const data = JSON.parse(stored);
        return {
          ...data,
          lastReadAt: new Date(data.lastReadAt)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting reading progress:', error);
      return null;
    }
  }

  async getAllUserProgress(userId: string): Promise<ReadingProgress[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith(`${PROGRESS_KEY}_${userId}_`));
      
      const progressData = await AsyncStorage.multiGet(progressKeys);
      
      return progressData
        .map(([key, value]) => {
          if (value) {
            const data = JSON.parse(value);
            return {
              ...data,
              lastReadAt: new Date(data.lastReadAt)
            };
          }
          return null;
        })
        .filter(Boolean) as ReadingProgress[];
    } catch (error) {
      console.error('Error getting all user progress:', error);
      return [];
    }
  }

  async updateScrollPosition(userId: string, articleId: string, scrollPosition: number, scrollY?: number, webViewUrl?: string): Promise<void> {
    try {
      const existingProgress = await this.getProgress(userId, articleId);
      
      const progress: ReadingProgress = {
        articleId,
        userId,
        scrollPosition: Math.max(0, Math.min(100, scrollPosition)),
        timeSpent: existingProgress ? existingProgress.timeSpent : 0,
        isCompleted: scrollPosition >= 90, // Consider 90% as completed
        lastReadAt: new Date(),
        resumePosition: {
          scrollY: scrollY || 0,
          webViewUrl
        }
      };

      await this.saveProgress(progress);
    } catch (error) {
      console.error('Error updating scroll position:', error);
    }
  }

  async updateTimeSpent(userId: string, articleId: string, additionalTime: number): Promise<void> {
    try {
      const existingProgress = await this.getProgress(userId, articleId);
      
      const progress: ReadingProgress = {
        articleId,
        userId,
        scrollPosition: existingProgress ? existingProgress.scrollPosition : 0,
        timeSpent: (existingProgress ? existingProgress.timeSpent : 0) + additionalTime,
        isCompleted: existingProgress ? existingProgress.isCompleted : false,
        lastReadAt: new Date(),
        resumePosition: existingProgress ? existingProgress.resumePosition : undefined
      };

      await this.saveProgress(progress);
    } catch (error) {
      console.error('Error updating time spent:', error);
    }
  }

  async markAsCompleted(userId: string, articleId: string): Promise<void> {
    try {
      const existingProgress = await this.getProgress(userId, articleId);
      
      if (existingProgress) {
        existingProgress.isCompleted = true;
        existingProgress.scrollPosition = 100;
        existingProgress.lastReadAt = new Date();
        await this.saveProgress(existingProgress);
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  }

  async getInProgressArticles(userId: string): Promise<ReadingProgress[]> {
    try {
      const allProgress = await this.getAllUserProgress(userId);
      return allProgress.filter(p => !p.isCompleted && p.scrollPosition > 5);
    } catch (error) {
      console.error('Error getting in-progress articles:', error);
      return [];
    }
  }

  async getCompletedArticles(userId: string): Promise<ReadingProgress[]> {
    try {
      const allProgress = await this.getAllUserProgress(userId);
      return allProgress.filter(p => p.isCompleted);
    } catch (error) {
      console.error('Error getting completed articles:', error);
      return [];
    }
  }

  async deleteProgress(userId: string, articleId: string): Promise<void> {
    try {
      const key = `${PROGRESS_KEY}_${userId}_${articleId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error deleting progress:', error);
    }
  }

  async clearAllProgress(userId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith(`${PROGRESS_KEY}_${userId}_`));
      await AsyncStorage.multiRemove(progressKeys);
    } catch (error) {
      console.error('Error clearing all progress:', error);
    }
  }
}