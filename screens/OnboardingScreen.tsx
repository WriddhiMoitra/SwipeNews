import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowRight, 
  BookOpen, 
  Zap, 
  Award, 
  Users, 
  Settings, 
  Play,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { fallbackTheme } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  interactive?: boolean;
  demo?: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SwipeNews',
    subtitle: 'Your Personalized News Experience',
    description: 'Discover news that matters to you with our intelligent recommendation system. Swipe through articles tailored to your interests.',
    icon: BookOpen,
    color: '#3B82F6',
  },
  {
    id: 'swipe',
    title: 'Master the Swipe',
    subtitle: 'Navigate with Simple Gestures',
    description: 'Swipe up to save articles for later, swipe down to move to the next story, and swipe right to bookmark instantly.',
    icon: Zap,
    color: '#10B981',
    interactive: true,
  },
  {
    id: 'gamification',
    title: 'Earn Rewards',
    subtitle: 'Level Up Your Reading',
    description: 'Complete challenges, earn badges, and climb the leaderboard. Turn your news reading into an engaging experience.',
    icon: Award,
    color: '#F59E0B',
    interactive: true,
  },
  {
    id: 'personalization',
    title: 'Smart Personalization',
    subtitle: 'Content That Adapts to You',
    description: 'Our AI learns your preferences and delivers increasingly relevant content. The more you read, the better it gets.',
    icon: Settings,
    color: '#8B5CF6',
  },
  {
    id: 'community',
    title: 'Join the Community',
    subtitle: 'Share and Discover Together',
    description: 'Share interesting articles, compete with friends, and discover trending stories from our global community.',
    icon: Users,
    color: '#EF4444',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingScreen({ onComplete, onSkip }: OnboardingScreenProps) {
  const { theme } = useTheme();
  const activeTheme = theme || fallbackTheme;
  const styles = getStyles(activeTheme);

  const [currentStep, setCurrentStep] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  // Animations
  const slideAnim = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);
  const progressAnim = useSharedValue(0);
  const demoCardAnim = useSharedValue(0);

  useEffect(() => {
    // Animate entrance
    fadeAnim.value = withDelay(200, withSpring(1));
    scaleAnim.value = withDelay(300, withSpring(1));
    progressAnim.value = withSpring((currentStep + 1) / onboardingSteps.length);
  }, [currentStep]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [
      { scale: scaleAnim.value },
      { translateX: slideAnim.value },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const demoCardStyle = useAnimatedStyle(() => ({
    opacity: demoCardAnim.value,
    transform: [
      { scale: interpolate(demoCardAnim.value, [0, 1], [0.8, 1]) },
      { translateY: interpolate(demoCardAnim.value, [0, 1], [50, 0]) },
    ],
  }));

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      slideAnim.value = withSequence(
        withTiming(-SCREEN_WIDTH, { duration: 300 }),
        withTiming(SCREEN_WIDTH, { duration: 0 }),
        withTiming(0, { duration: 300 })
      );
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      slideAnim.value = withSequence(
        withTiming(SCREEN_WIDTH, { duration: 300 }),
        withTiming(-SCREEN_WIDTH, { duration: 0 }),
        withTiming(0, { duration: 300 })
      );
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 300);
    }
  };

  const triggerDemo = () => {
    if (onboardingSteps[currentStep].interactive) {
      setShowDemo(true);
      demoCardAnim.value = withSpring(1);
      
      // Auto-hide demo after 3 seconds
      setTimeout(() => {
        demoCardAnim.value = withSpring(0);
        setTimeout(() => setShowDemo(false), 300);
      }, 3000);
    }
  };

  const renderSwipeDemo = () => (
    <Animated.View style={[styles.demoCard, demoCardStyle]}>
      <View style={styles.demoArticle}>
        <Text style={styles.demoTitle}>Sample News Article</Text>
        <Text style={styles.demoContent}>This is how articles appear in your feed...</Text>
      </View>
      <View style={styles.swipeInstructions}>
        <View style={styles.swipeInstruction}>
          <ArrowRight size={16} color="#10B981" style={{ transform: [{ rotate: '-90deg' }] }} />
          <Text style={styles.swipeText}>Swipe up to save</Text>
        </View>
        <View style={styles.swipeInstruction}>
          <ArrowRight size={16} color="#3B82F6" style={{ transform: [{ rotate: '90deg' }] }} />
          <Text style={styles.swipeText}>Swipe down for next</Text>
        </View>
        <View style={styles.swipeInstruction}>
          <ArrowRight size={16} color="#F59E0B" />
          <Text style={styles.swipeText}>Swipe right to bookmark</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderGamificationDemo = () => (
    <Animated.View style={[styles.demoCard, demoCardStyle]}>
      <View style={styles.gamificationDemo}>
        <View style={styles.pointsDemo}>
          <Award size={24} color="#F59E0B" />
          <Text style={styles.pointsText}>+10 Points</Text>
        </View>
        <View style={styles.badgeDemo}>
          <Text style={styles.badgeIcon}>🏆</Text>
          <Text style={styles.badgeText}>First Article Badge</Text>
        </View>
        <View style={styles.levelDemo}>
          <Text style={styles.levelText}>Level 2</Text>
          <View style={styles.levelProgress}>
            <View style={[styles.levelProgressFill, { width: '60%' }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </View>

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>Skip</Text>
        <X size={16} color={activeTheme.colors.textSecondary} />
      </TouchableOpacity>

      {/* Main Content */}
      <Animated.View style={[styles.content, animatedStyle]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: currentStepData.color + '20' }]}>
          <IconComponent size={48} color={currentStepData.color} strokeWidth={2} />
        </View>

        {/* Text Content */}
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>

        {/* Interactive Demo Button */}
        {currentStepData.interactive && (
          <TouchableOpacity style={styles.demoButton} onPress={triggerDemo}>
            <Play size={16} color="white" />
            <Text style={styles.demoButtonText}>Try Interactive Demo</Text>
          </TouchableOpacity>
        )}

        {/* Demo Overlay */}
        {showDemo && currentStep === 1 && renderSwipeDemo()}
        {showDemo && currentStep === 2 && renderGamificationDemo()}
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {/* Previous Button */}
        {currentStep > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <ChevronLeft size={20} color={activeTheme.colors.text} />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.activeDot,
                { backgroundColor: index === currentStep ? currentStepData.color : activeTheme.colors.border }
              ]}
            />
          ))}
        </View>

        {/* Next/Complete Button */}
        <TouchableOpacity 
          style={[styles.nextButton, { backgroundColor: currentStepData.color }]} 
          onPress={handleNext}
        >
          {currentStep === onboardingSteps.length - 1 ? (
            <>
              <Check size={20} color="white" />
              <Text style={styles.nextButtonText}>Get Started</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>Next</Text>
              <ChevronRight size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Quick Tip</Text>
        <Text style={styles.tipsText}>
          {currentStep === 0 && "You can always access this tutorial from Settings"}
          {currentStep === 1 && "Practice swiping on any article to get comfortable"}
          {currentStep === 2 && "Check your progress anytime in the Profile tab"}
          {currentStep === 3 && "Your feed improves with every article you read"}
          {currentStep === 4 && "Share articles to help others discover great content"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginRight: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  demoCard: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  demoArticle: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  demoContent: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  swipeInstructions: {
    gap: 12,
  },
  swipeInstruction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },
  gamificationDemo: {
    alignItems: 'center',
    gap: 16,
  },
  pointsDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
  badgeDemo: {
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  levelDemo: {
    alignItems: 'center',
    width: '100%',
  },
  levelText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  levelProgress: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  tipsContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
});