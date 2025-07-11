import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'has_completed_onboarding';
const TUTORIAL_ACCESS_KEY = 'tutorial_access_count';

export const useOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const trackTutorialAccess = async () => {
    try {
      const currentCount = await AsyncStorage.getItem(TUTORIAL_ACCESS_KEY);
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
      await AsyncStorage.setItem(TUTORIAL_ACCESS_KEY, newCount.toString());
    } catch (error) {
      console.error('Error tracking tutorial access:', error);
    }
  };

  const getTutorialAccessCount = async (): Promise<number> => {
    try {
      const count = await AsyncStorage.getItem(TUTORIAL_ACCESS_KEY);
      return count ? parseInt(count) : 0;
    } catch (error) {
      console.error('Error getting tutorial access count:', error);
      return 0;
    }
  };

  return {
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
    trackTutorialAccess,
    getTutorialAccessCount,
  };
};