import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PersonalizedNewsService } from '../services/personalizedNewsService';
import { UserProfileService } from '../services/userProfileService';
import { PersonalizationConfig } from '../types/UserProfile';
import { useAuth } from './AuthContext';

interface PersonalizationContextType {
  config: PersonalizationConfig;
  updateConfig: (newConfig: Partial<PersonalizationConfig>) => void;
  getUserStats: () => Promise<any>;
  resetPersonalization: () => Promise<void>;
  isPersonalizationEnabled: boolean;
  setPersonalizationEnabled: (enabled: boolean) => void;
}

const defaultConfig: PersonalizationConfig = {
  categoryWeightDecay: 0.95,
  minInteractionsForPreference: 3,
  diversityFactor: 0.3,
  recencyBoost: 0.2,
  maxArticlesPerCategory: 3
};

const PersonalizationContext = createContext<PersonalizationContextType>({
  config: defaultConfig,
  updateConfig: () => {},
  getUserStats: async () => null,
  resetPersonalization: async () => {},
  isPersonalizationEnabled: true,
  setPersonalizationEnabled: () => {}
});

export const PersonalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PersonalizationConfig>(defaultConfig);
  const [isPersonalizationEnabled, setIsPersonalizationEnabled] = useState(true);
  const { user } = useAuth();
  const personalizedNewsService = PersonalizedNewsService.getInstance();

  const updateConfig = (newConfig: Partial<PersonalizationConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    personalizedNewsService.updatePersonalizationConfig(updatedConfig);
  };

  const getUserStats = async () => {
    if (!user) return null;
    return await personalizedNewsService.getUserReadingStats(user.id);
  };

  const resetPersonalization = async () => {
    if (!user) return;
    
    try {
      const userProfileService = UserProfileService.getInstance();
      // Create a fresh profile for the user
      const defaultProfile = {
        userId: user.id,
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
      
      await userProfileService.saveUserProfile(defaultProfile);
    } catch (error) {
      console.error('Error resetting personalization:', error);
    }
  };

  return (
    <PersonalizationContext.Provider value={{
      config,
      updateConfig,
      getUserStats,
      resetPersonalization,
      isPersonalizationEnabled,
      setPersonalizationEnabled
    }}>
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = () => useContext(PersonalizationContext);