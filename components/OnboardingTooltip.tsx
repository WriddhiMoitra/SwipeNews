import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import Animated,
{
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { ArrowUp, ArrowDown, X, Sparkles } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingTooltipProps {
  onComplete: () => void;
}

/**
 * OnboardingTooltip provides an interactive, animated tutorial for new users.
 *
 * Features:
 * - 4 steps: welcome, swipe up, swipe down, swipe right
 * - Animated icons for each gesture
 * - Auto-progression with manual controls
 * - Skip option
 * - Accessibility and documentation
 *
 * @param {OnboardingTooltipProps} props
 */
const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const arrowScale = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  const steps = [
    {
      title: 'Welcome to SwipeNews! ✨',
      description: 'Discover personalized news that matters to you with our intelligent recommendation system.',
      position: 'center',
      icon: Sparkles,
      color: '#8B5CF6',
      animate: 'sparkle',
    },
    {
      title: 'Swipe Up to Save 📚',
      description: 'Found something interesting? Swipe up to bookmark articles for later reading.',
      position: 'bottom',
      icon: ArrowUp,
      color: '#10B981',
      animate: 'arrowUp',
    },
    {
      title: 'Swipe Down for Next 📰',
      description: 'Ready for the next story? Swipe down to continue your personalized news journey.',
      position: 'top',
      icon: ArrowDown,
      color: '#3B82F6',
      animate: 'arrowDown',
    },
    {
      title: 'Swipe Right to Save ⭐️',
      description: 'Swipe right on an article to instantly save it to your bookmarks.',
      position: 'center',
      icon: ArrowUp, // Use ArrowUp rotated for right swipe
      color: '#F59E0B',
      animate: 'arrowRight',
    },
  ];

  useEffect(() => {
    // Entrance animation
    scale.value = withDelay(300, withSpring(1, {
      damping: 20,
      stiffness: 300,
      mass: 0.8
    }));

    opacity.value = withDelay(300, withSpring(1, {
      damping: 25,
      stiffness: 400
    }));

    contentTranslateY.value = withDelay(400, withSpring(0, {
      damping: 20,
      stiffness: 300
    }));

    // Continuous animations
    arrowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
  }, [currentStep]);

  // Add auto-progression
  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Animate out current step
      contentTranslateY.value = withTiming(-20, { duration: 200 });
      opacity.value = withTiming(0.7, { duration: 200 });

      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        // Animate in new step
        contentTranslateY.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(1, { duration: 300 });
      }, 200);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    scale.value = withSpring(0, { damping: 20, stiffness: 300 });
    opacity.value = withSpring(0, { damping: 25, stiffness: 400 });
    setTimeout(onComplete, 300);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: arrowScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  // Animated icon logic
  const arrowRightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: '90deg' },
      { scale: arrowScale.value },
    ],
  }));

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  const getTooltipPosition = () => {
    switch (currentStepData.position) {
      case 'top':
        return {
          top: SCREEN_HEIGHT * 0.15,
          justifyContent: 'flex-start' as const
        };
      case 'bottom':
        return {
          bottom: SCREEN_HEIGHT * 0.15,
          justifyContent: 'flex-end' as const
        };
      default:
        return {
          justifyContent: 'center' as const,
          alignItems: 'center' as const
        };
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      ...getTooltipPosition(),
      paddingHorizontal: 24,
    },
    tooltip: {
      backgroundColor: theme.colors.card,
      borderRadius: 28,
      padding: 32,
      marginHorizontal: 8,
      maxWidth: SCREEN_WIDTH - 48,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 25,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: currentStepData.color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
      letterSpacing: -0.5,
    },
    description: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    actions: {
      flexDirection: 'row',
      gap: 16,
      width: '100%',
    },
    button: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      backgroundColor: currentStepData.color,
      shadowColor: currentStepData.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    buttonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
    },
    primaryButtonText: {
      color: 'white',
      fontFamily: 'Inter-Bold',
    },
    stepIndicator: {
      flexDirection: 'row',
      marginBottom: 24,
      gap: 12,
    },
    stepDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    stepDotActive: {
      backgroundColor: currentStepData.color,
      borderColor: currentStepData.color,
      transform: [{ scale: 1.2 }],
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: theme.colors.surface,
      borderRadius: 2,
      marginBottom: 24,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: currentStepData.color,
      borderRadius: 2,
    },
  });

  const progressWidth = ((currentStep + 1) / steps.length) * 100;

  return (
    <Modal visible transparent animationType="fade" accessible accessibilityLabel="Onboarding tutorial">
      <BlurView intensity={20} style={styles.overlay}>
        <Animated.View style={[styles.tooltip, animatedStyle]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} accessibilityLabel="Skip tutorial">
            <X size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Animated.View style={contentAnimatedStyle}>
            {/* Progress Bar */}
            <View style={styles.progressBar} accessible accessibilityLabel={`Step ${currentStep + 1} of ${steps.length}`}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: `${progressWidth}%` }
                ]}
              />
            </View>
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepDot,
                    index === currentStep && styles.stepDotActive,
                  ]}
                />
              ))}
            </View>
            {/* Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { backgroundColor: currentStepData.color + '20' },
                currentStepData.animate === 'sparkle' ? sparkleAnimatedStyle :
                  currentStepData.animate === 'arrowUp' ? arrowAnimatedStyle :
                    currentStepData.animate === 'arrowDown' ? arrowAnimatedStyle :
                      currentStepData.animate === 'arrowRight' ? arrowRightAnimatedStyle : null
              ]}
              accessible accessibilityLabel={`Step icon: ${currentStepData.title}`}
            >
              <IconComponent size={36} color={currentStepData.color} strokeWidth={2.5} />
            </Animated.View>
            {/* Content */}
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>
            {/* Actions */}
            <View style={styles.actions}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={[styles.button, { flex: 1 }]}
                  onPress={() => setCurrentStep(currentStep - 1)}
                  accessibilityLabel="Back"
                >
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { flex: 1, marginHorizontal: 4 },
                ]}
                onPress={handleNext}
                accessibilityLabel={currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </Text>
              </TouchableOpacity>
              {currentStep < steps.length - 1 && (
                <TouchableOpacity
                  style={[styles.button, { flex: 1, backgroundColor: 'transparent', borderWidth: 0, marginLeft: 4 }]}
                  onPress={handleClose}
                  accessibilityLabel="Skip tutorial"
                >
                  <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default OnboardingTooltip;