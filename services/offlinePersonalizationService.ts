import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, CategoryPreference, SourcePreference } from '../types/UserProfile';

const OFFLINE_PROFILE_KEY = 'offline_user_profile';
const OFFLINE_INTERACTIONS_KEY = 'offline_interactions';

interface OfflineInteraction {
  type: 'read' | 'save' | 'share' | 'skip';
  articleId: string;
  category: string;
  sourceId: string;
  timestamp: Date;
}

export class OfflinePersonalizationService {
  private static instance: OfflinePersonalizationService;

  static getInstance(): OfflinePersonalizationService {
    if (!OfflinePersonalizationService.instance) {
      OfflinePersonalizationService.instance = new OfflinePersonalizationService();
    }
    return OfflinePersonalizationService.instance;
  }

  /**
   * Store user interactions offline when network is unavailable
   */
  async storeOfflineInteraction(interaction: Omit<OfflineInteraction, 'timestamp'>): Promise<void> {
    try {
      const existingInteractions = await this.getOfflineInteractions();
      const newInteraction: OfflineInteraction = {
        ...interaction,
        timestamp: new Date()
      };
      
      existingInteractions.push(newInteraction);
      await AsyncStorage.setItem(OFFLINE_INTERACTIONS_KEY, JSON.stringify(existingInteractions));
    } catch (error) {
      console.error('Error storing offline interaction:', error);
    }
  }

  /**
   * Get stored offline interactions
   */
  async getOfflineInteractions(): Promise<OfflineInteraction[]> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_INTERACTIONS_KEY);
      if (stored) {
        const interactions = JSON.parse(stored);
        return interactions.map((interaction: any) => ({
          ...interaction,
          timestamp: new Date(interaction.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting offline interactions:', error);
      return [];
    }
  }

  /**
   * Clear offline interactions after syncing
   */
  async clearOfflineInteractions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_INTERACTIONS_KEY);
    } catch (error) {
      console.error('Error clearing offline interactions:', error);
    }
  }

  /**
   * Store user profile offline
   */
  async storeOfflineProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error storing offline profile:', error);
    }
  }

  /**
   * Get offline user profile
   */
  async getOfflineProfile(): Promise<UserProfile | null> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_PROFILE_KEY);
      if (stored) {
        const profile = JSON.parse(stored);
        return {
          ...profile,
          createdAt: new Date(profile.createdAt),
          updatedAt: new Date(profile.updatedAt),
          categoryPreferences: profile.categoryPreferences.map((cp: any) => ({
            ...cp,
            lastInteraction: new Date(cp.lastInteraction)
          })),
          sourcePreferences: profile.sourcePreferences.map((sp: any) => ({
            ...sp,
            lastInteraction: new Date(sp.lastInteraction)
          }))
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting offline profile:', error);
      return null;
    }
  }

  /**
   * Update offline profile with new interaction
   */
  async updateOfflineProfile(
    userId: string,
    category: string,
    sourceId: string,
    interactionType: 'read' | 'save' | 'share' | 'skip'
  ): Promise<void> {
    try {
      let profile = await this.getOfflineProfile();
      
      if (!profile) {
        // Create default profile
        profile = {
          userId,
          language: 'en',
          region: 'india',
          categoryPreferences: [],
          sourcePreferences: [],
          behaviorData: {
            totalArticlesRead: 0,
            totalArticlesSaved: 0,
            totalArticlesShared: 0,
            averageReadingTime: 3,
            preferredReadingTimes: [],
            swipePatterns: { upSwipes: 0, downSwipes: 0 }
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        };
      }

      // Update category preference
      let categoryPref = profile.categoryPreferences.find(cp => cp.category === category);
      if (!categoryPref) {
        categoryPref = {
          category,
          weight: 0.5,
          interactionCount: 0,
          lastInteraction: new Date()
        };
        profile.categoryPreferences.push(categoryPref);
      }

      const weightChange = this.getWeightChange(interactionType);
      categoryPref.weight = Math.max(0, Math.min(1, categoryPref.weight + weightChange));
      categoryPref.interactionCount++;
      categoryPref.lastInteraction = new Date();

      // Update source preference
      let sourcePref = profile.sourcePreferences.find(sp => sp.sourceId === sourceId);
      if (!sourcePref) {
        sourcePref = {
          sourceId,
          weight: 0.5,
          interactionCount: 0,
          lastInteraction: new Date()
        };
        profile.sourcePreferences.push(sourcePref);
      }

      sourcePref.weight = Math.max(0, Math.min(1, sourcePref.weight + weightChange));
      sourcePref.interactionCount++;
      sourcePref.lastInteraction = new Date();

      // Update behavior data
      if (interactionType === 'read') {
        profile.behaviorData.totalArticlesRead++;
      } else if (interactionType === 'save') {
        profile.behaviorData.totalArticlesSaved++;
      } else if (interactionType === 'share') {
        profile.behaviorData.totalArticlesShared++;
      }

      profile.updatedAt = new Date();

      await this.storeOfflineProfile(profile);
    } catch (error) {
      console.error('Error updating offline profile:', error);
    }
  }

  private getWeightChange(interactionType: 'read' | 'save' | 'share' | 'skip'): number {
    switch (interactionType) {
      case 'save': return 0.15;
      case 'share': return 0.12;
      case 'read': return 0.08;
      case 'skip': return -0.05;
      default: return 0;
    }
  }

  /**
   * Sync offline data with online services when connection is restored
   */
  async syncOfflineData(userProfileService: any): Promise<void> {
    try {
      const interactions = await this.getOfflineInteractions();
      const profile = await this.getOfflineProfile();

      if (profile && interactions.length > 0) {
        // Apply all offline interactions to the online profile
        for (const interaction of interactions) {
          await userProfileService.updateCategoryPreference(
            profile.userId,
            interaction.category,
            interaction.type
          );
          await userProfileService.updateSourcePreference(
            profile.userId,
            interaction.sourceId,
            interaction.type
          );
        }

        // Clear offline data after successful sync
        await this.clearOfflineInteractions();
        console.log(`Synced ${interactions.length} offline interactions`);
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  /**
   * Check if we have offline personalization data
   */
  async hasOfflineData(): Promise<boolean> {
    try {
      const profile = await this.getOfflineProfile();
      const interactions = await this.getOfflineInteractions();
      return !!profile || interactions.length > 0;
    } catch (error) {
      console.error('Error checking offline data:', error);
      return false;
    }
  }
}