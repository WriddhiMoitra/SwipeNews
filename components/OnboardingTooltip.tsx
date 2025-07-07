import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { ArrowUp, ArrowDown, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingTooltipProps {
  onComplete: () => void;
}

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const arrowScale = useSharedValue(1);

  const steps = [
    {
      title: 'Welcome to SwipeNews!',
      description: 'Discover news that matters to you with personalized recommendations.',
      position: 'center',
    },
    {
      title: 'Swipe Up to Save',
      description: 'Found something interesting? Swipe up to save articles for later reading.',
      position: 'bottom',
      icon: ArrowUp,
    },
    {
      title: 'Swipe Down for Next',
      description: 'Ready for the next story? Swipe down to continue your news journey.',
      position: 'top',
      icon: ArrowDown,
    },
  ];

  useEffect(() => {
    // Animate in
    scale.value = withDelay(300, withSpring(1, { damping: 20, stiffness: 300 }));
    opacity.value = withDelay(300, withSpring(1));

    // Animate arrow
    arrowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    scale.value = withSpring(0);
    opacity.value = withSpring(0);
    setTimeout(onComplete, 300);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: arrowScale.value }],
  }));

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  const getTooltipPosition = () => {
    switch (currentStepData.position) {
      case 'top':
        return { top: SCREEN_HEIGHT * 0.2 };
      case 'bottom':
        return { bottom: SCREEN_HEIGHT * 0.2 };
      default:
        return { top: SCREEN_HEIGHT * 0.4 };
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tooltip: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 32,
      maxWidth: SCREEN_WIDTH - 64,
      alignItems: 'center',
      ...getTooltipPosition(),
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      padding: 8,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
    },
    primaryButtonText: {
      color: 'white',
    },
    stepIndicator: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 8,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.surface,
    },
    stepDotActive: {
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <Modal visible transparent animationType="fade">
      <BlurView intensity={20} style={styles.overlay}>
        <Animated.View style={[styles.tooltip, animatedStyle]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

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
          {IconComponent && (
            <Animated.View style={[styles.iconContainer, arrowAnimatedStyle]}>
              <IconComponent size={28} color={theme.colors.primary} />
            </Animated.View>
          )}

          {/* Content */}
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleNext}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default OnboardingTooltip;