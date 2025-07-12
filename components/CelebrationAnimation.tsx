import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Award, Star, Trophy, Zap } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CelebrationAnimationProps {
  visible: boolean;
  type: 'badge' | 'level' | 'challenge' | 'points';
  title: string;
  subtitle?: string;
  icon?: string;
  onComplete?: () => void;
}

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  visible,
  type,
  title,
  subtitle,
  icon,
  onComplete,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const confettiScale = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);
  const slideY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      // Main animation sequence
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      slideY.value = withSpring(0, { damping: 20, stiffness: 300 });

      // Confetti animation
      confettiOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
      confettiScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 200 }));

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        confettiOpacity.value = withTiming(0, { duration: 300 });
        
        setTimeout(() => {
          if (onComplete) {
            runOnJS(onComplete)();
          }
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: slideY.value },
    ],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
    transform: [{ scale: confettiScale.value }],
  }));

  const getTypeColor = () => {
    switch (type) {
      case 'badge': return '#F59E0B';
      case 'level': return '#8B5CF6';
      case 'challenge': return '#10B981';
      case 'points': return '#3B82F6';
      default: return '#F59E0B';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'badge': return Award;
      case 'level': return Star;
      case 'challenge': return Trophy;
      case 'points': return Zap;
      default: return Award;
    }
  };

  if (!visible) return null;

  const TypeIcon = getTypeIcon();
  const typeColor = getTypeColor();

  return (
    <View style={styles.overlay}>
      {/* Confetti Background */}
      <Animated.View style={[styles.confettiContainer, confettiStyle]}>
        {Array.from({ length: 20 }).map((_, index) => (
          <ConfettiPiece key={index} index={index} color={typeColor} />
        ))}
      </Animated.View>

      {/* Main Celebration Card */}
      <Animated.View style={[styles.celebrationCard, animatedStyle]}>
        <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
          {icon ? (
            <Text style={styles.emojiIcon}>{icon}</Text>
          ) : (
            <TypeIcon size={48} color={typeColor} strokeWidth={2} />
          )}
        </View>
        
        <Text style={styles.celebrationTitle}>{title}</Text>
        {subtitle && <Text style={styles.celebrationSubtitle}>{subtitle}</Text>}
        
        <View style={[styles.celebrationBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.celebrationBadgeText}>
            {type === 'badge' && '🏆 Badge Unlocked!'}
            {type === 'level' && '⭐ Level Up!'}
            {type === 'challenge' && '✅ Challenge Complete!'}
            {type === 'points' && '⚡ Points Earned!'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const ConfettiPiece: React.FC<{ index: number; color: string }> = ({ index, color }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const startX = (Math.random() - 0.5) * SCREEN_WIDTH;
    const startY = -50;
    const endX = startX + (Math.random() - 0.5) * 200;
    const endY = SCREEN_HEIGHT + 100;

    translateX.value = withDelay(
      index * 50,
      withTiming(endX, { duration: 3000 })
    );
    translateY.value = withDelay(
      index * 50,
      withTiming(endY, { duration: 3000 })
    );
    rotate.value = withDelay(
      index * 50,
      withTiming(Math.random() * 720, { duration: 3000 })
    );
    opacity.value = withDelay(
      index * 50 + 2000,
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    top: -50,
    left: SCREEN_WIDTH / 2,
  },
  celebrationCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emojiIcon: {
    fontSize: 48,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  celebrationBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  celebrationBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CelebrationAnimation;