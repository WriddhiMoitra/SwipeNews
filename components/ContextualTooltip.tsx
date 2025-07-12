import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { X, Info } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ContextualTooltipProps {
  visible: boolean;
  title: string;
  description: string;
  position: { x: number; y: number };
  onDismiss: () => void;
  arrow?: 'top' | 'bottom' | 'left' | 'right';
}

const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  visible,
  title,
  description,
  position,
  onDismiss,
  arrow = 'top',
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 300 }));
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  const getTooltipPosition = () => {
    const tooltipWidth = Math.min(280, SCREEN_WIDTH - 40);
    const tooltipHeight = 120; // Approximate height
    
    let left = position.x - tooltipWidth / 2;
    let top = position.y;

    // Adjust for screen boundaries
    if (left < 20) left = 20;
    if (left + tooltipWidth > SCREEN_WIDTH - 20) left = SCREEN_WIDTH - tooltipWidth - 20;

    switch (arrow) {
      case 'top':
        top = position.y - tooltipHeight - 10;
        break;
      case 'bottom':
        top = position.y + 10;
        break;
      case 'left':
        left = position.x - tooltipWidth - 10;
        top = position.y - tooltipHeight / 2;
        break;
      case 'right':
        left = position.x + 10;
        top = position.y - tooltipHeight / 2;
        break;
    }

    return { left, top };
  };

  const tooltipPosition = getTooltipPosition();

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
    },
    tooltip: {
      position: 'absolute',
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      maxWidth: 280,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      left: tooltipPosition.left,
      top: tooltipPosition.top,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    icon: {
      marginRight: 8,
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    closeButton: {
      padding: 4,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    arrow: {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
    arrowTop: {
      bottom: -8,
      left: '50%',
      marginLeft: -8,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderTopWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: theme.colors.card,
    },
    arrowBottom: {
      top: -8,
      left: '50%',
      marginLeft: -8,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderBottomWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: theme.colors.card,
    },
    arrowLeft: {
      right: -8,
      top: '50%',
      marginTop: -8,
      borderTopWidth: 8,
      borderBottomWidth: 8,
      borderLeftWidth: 8,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftColor: theme.colors.card,
    },
    arrowRight: {
      left: -8,
      top: '50%',
      marginTop: -8,
      borderTopWidth: 8,
      borderBottomWidth: 8,
      borderRightWidth: 8,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderRightColor: theme.colors.card,
    },
  });

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.overlay} onPress={onDismiss} activeOpacity={1} />
      <Animated.View style={[styles.tooltip, animatedStyle]}>
        <View style={styles.header}>
          <Info size={16} color={theme.colors.primary} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
            <X size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>{description}</Text>
        
        {/* Arrow */}
        <View style={[
          styles.arrow,
          arrow === 'top' && styles.arrowTop,
          arrow === 'bottom' && styles.arrowBottom,
          arrow === 'left' && styles.arrowLeft,
          arrow === 'right' && styles.arrowRight,
        ]} />
      </Animated.View>
    </View>
  );
};

export default ContextualTooltip;