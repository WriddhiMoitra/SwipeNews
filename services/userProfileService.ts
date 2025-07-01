import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, CategoryPreference, SourcePreference, UserBehaviorData } from '../types/UserProfile';

const DEFAULT_CATEGORIES = [
  'general', 'business', 'entertainment', 'health', 'science', 
  'sports', 'technology', 'politics', 'world', 'national'
];

export class UserProfileService {
  private static instance: UserProfileService;
  private userProfile: UserProfile | null = null;

  static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    if (this.userProfile && this.userProfile.userId === userId) {
      return this.userProfile;
    }

    try {
      const profileDoc = await getDoc(doc(db, 'userProfiles', userId));
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        this.userProfile = {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          categoryPreferences: data.categoryPreferences.map((cp: any) => ({
            ...cp,
            lastInteraction: cp.lastInteraction.toDate()
          })),
          sourcePreferences: data.sourcePreferences.map((sp: any) => ({
            ...sp,
            lastInteraction: sp.lastInteraction.toDate()
          }))
        } as UserProfile;
      } else {
        // Create default profile for new user
        this.userProfile = this.createDefaultProfile(userId);
        await this.saveUserProfile(this.userProfile);
      }

      return this.userProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return this.createDefaultProfile(userId);
    }
  }

  private createDefaultProfile(userId: string): UserProfile {
    const now = new Date();
    return {
      userId,
      language: 'en',
      region: 'india',
      categoryPreferences: DEFAULT_CATEGORIES.map(category => ({
        category,
        weight: 0.5, // neutral starting weight
        interactionCount: 0,
        lastInteraction: now
      })),
      sourcePreferences: [],
      behaviorData: {
        totalArticlesRead: 0,
        totalArticlesSaved: 0,
        totalArticlesShared: 0,
        averageReadingTime: 3, // default 3 minutes
        preferredReadingTimes: [],
        swipePatterns: {
          upSwipes: 0,
          downSwipes: 0
        }
      },
      createdAt: now,
      updatedAt: now,
      version: 1
    };
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const profileData = {
        ...profile,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'userProfiles', profile.userId), profileData);
      this.userProfile = profile;
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  async updateCategoryPreference(
    userId: string, 
    category: string, 
    interactionType: 'read' | 'save' | 'share' | 'skip'
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
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

    // Update weights based on interaction type
    const weightChange = this.getWeightChange(interactionType);
    categoryPref.weight = Math.max(0, Math.min(1, categoryPref.weight + weightChange));
    categoryPref.interactionCount++;
    categoryPref.lastInteraction = new Date();

    // Apply time decay to other categories
    this.applyTimeDecay(profile.categoryPreferences, category);

    await this.saveUserProfile(profile);
  }

  async updateSourcePreference(
    userId: string, 
    sourceId: string, 
    interactionType: 'read' | 'save' | 'share' | 'skip'
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
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

    const weightChange = this.getWeightChange(interactionType);
    sourcePref.weight = Math.max(0, Math.min(1, sourcePref.weight + weightChange));
    sourcePref.interactionCount++;
    sourcePref.lastInteraction = new Date();

    await this.saveUserProfile(profile);
  }

  async updateBehaviorData(
    userId: string, 
    behaviorUpdate: Partial<UserBehaviorData>
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
    // Update behavior data
    if (behaviorUpdate.totalArticlesRead !== undefined) {
      profile.behaviorData.totalArticlesRead += behaviorUpdate.totalArticlesRead;
    }
    if (behaviorUpdate.totalArticlesSaved !== undefined) {
      profile.behaviorData.totalArticlesSaved += behaviorUpdate.totalArticlesSaved;
    }
    if (behaviorUpdate.totalArticlesShared !== undefined) {
      profile.behaviorData.totalArticlesShared += behaviorUpdate.totalArticlesShared;
    }
    if (behaviorUpdate.averageReadingTime !== undefined) {
      // Calculate rolling average
      const totalReads = profile.behaviorData.totalArticlesRead;
      if (totalReads > 0) {
        profile.behaviorData.averageReadingTime = 
          (profile.behaviorData.averageReadingTime * (totalReads - 1) + behaviorUpdate.averageReadingTime) / totalReads;
      }
    }

    // Track preferred reading times
    const currentHour = new Date().getHours();
    if (!profile.behaviorData.preferredReadingTimes.includes(currentHour)) {
      profile.behaviorData.preferredReadingTimes.push(currentHour);
    }

    await this.saveUserProfile(profile);
  }

  async updateSwipePattern(userId: string, swipeDirection: 'up' | 'down'): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
    if (swipeDirection === 'up') {
      profile.behaviorData.swipePatterns.upSwipes++;
    } else {
      profile.behaviorData.swipePatterns.downSwipes++;
    }

    await this.saveUserProfile(profile);
  }

  private getWeightChange(interactionType: 'read' | 'save' | 'share' | 'skip'): number {
    switch (interactionType) {
      case 'save': return 0.15; // strong positive signal
      case 'share': return 0.12; // strong positive signal
      case 'read': return 0.08; // moderate positive signal
      case 'skip': return -0.05; // mild negative signal
      default: return 0;
    }
  }

  private applyTimeDecay(preferences: CategoryPreference[], excludeCategory?: string): void {
    const now = new Date();
    const decayRate = 0.95; // 5% decay per week
    
    preferences.forEach(pref => {
      if (pref.category === excludeCategory) return;
      
      const daysSinceLastInteraction = 
        (now.getTime() - pref.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastInteraction > 7) {
        const weeksDecay = Math.floor(daysSinceLastInteraction / 7);
        pref.weight *= Math.pow(decayRate, weeksDecay);
      }
    });
  }

  // Get top preferred categories for the user
  getTopCategories(profile: UserProfile, limit: number = 5): string[] {
    return profile.categoryPreferences
      .filter(cp => cp.interactionCount >= 3) // minimum interactions
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit)
      .map(cp => cp.category);
  }

  // Get categories to diversify (least preferred but not disliked)
  getDiversityCategories(profile: UserProfile, limit: number = 3): string[] {
    return profile.categoryPreferences
      .filter(cp => cp.weight >= 0.3 && cp.weight <= 0.6) // neutral range
      .sort((a, b) => a.weight - b.weight)
      .slice(0, limit)
      .map(cp => cp.category);
  }
}