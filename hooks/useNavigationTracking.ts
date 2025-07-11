import { useEffect, useRef } from 'react';
import { useEnhancedAnalytics } from '../contexts/EnhancedAnalyticsContext';

/**
 * Hook to automatically track navigation events
 * @param screenName - The name of the current screen
 * @param trackPerformance - Whether to track screen load performance
 */
export const useNavigationTracking = (screenName: string, trackPerformance: boolean = true) => {
  const { trackNavigation, trackPerformance: trackPerf } = useEnhancedAnalytics();
  const previousScreenRef = useRef<string>('');
  const screenLoadStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const loadStartTime = screenLoadStartRef.current;
    const previousScreen = previousScreenRef.current;

    // Track navigation
    trackNavigation(screenName, previousScreen || undefined);

    // Track screen load performance
    if (trackPerformance) {
      const loadTime = Date.now() - loadStartTime;
      trackPerf('screen_load_time', loadTime, screenName);
    }

    // Update previous screen for next navigation
    previousScreenRef.current = screenName;

    // Reset load start time for next screen
    screenLoadStartRef.current = Date.now();
  }, [screenName, trackNavigation, trackPerf, trackPerformance]);

  return {
    trackScreenInteraction: (interaction: string, data?: any) => {
      // Can be used for additional screen-specific tracking
      console.log(`Screen interaction on ${screenName}:`, interaction, data);
    }
  };
};