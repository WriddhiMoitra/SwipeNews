import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.78;

const LoadingShimmer: React.FC = () => {
  const { theme } = useTheme();
  const shimmerTranslateX = useSharedValue(-SCREEN_WIDTH);
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    cardScale.value = withDelay(200, withTiming(1, { duration: 600 }));
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    // Shimmer animation
    shimmerTranslateX.value = withRepeat(
      withSequence(
        withTiming(SCREEN_WIDTH, { duration: 1800 }),
        withTiming(-SCREEN_WIDTH, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    card: {
      width: SCREEN_WIDTH - 32,
      height: CARD_HEIGHT,
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 20,
    },
    imageShimmer: {
      height: CARD_HEIGHT * 0.45,
      backgroundColor: theme.colors.surface,
      position: 'relative',
      overflow: 'hidden',
    },
    content: {
      padding: 24,
      flex: 1,
      justifyContent: 'space-between',
    },
    headerShimmer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sourceShimmer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sourceDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.surface,
      marginRight: 10,
    },
    sourceTextShimmer: {
      width: 80,
      height: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
    },
    timeShimmer: {
      width: 60,
      height: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
    },
    titleShimmer: {
      height: 24,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginBottom: 8,
    },
    titleShimmerShort: {
      width: '75%',
    },
    titleShimmerMedium: {
      width: '90%',
    },
    descriptionShimmer: {
      height: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      marginBottom: 6,
    },
    descriptionShimmerShort: {
      width: '65%',
    },
    actionsShimmer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionShimmer: {
      width: 80,
      height: 40,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
    },
    shimmerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 120,
      background: `linear-gradient(90deg, transparent, ${theme.colors.background}80, transparent)`,
    },
    pulseAnimation: {
      backgroundColor: theme.colors.surface,
    },
  });

  const ShimmerOverlay = () => (
    <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
  );

  return (
    <View style={styles.container}>
      {[1, 2].map((index) => (
        <Animated.View key={index} style={[styles.card, cardAnimatedStyle]}>
          {/* Image Shimmer */}
          <View style={styles.imageShimmer}>
            <ShimmerOverlay />
          </View>

          {/* Content Shimmer */}
          <View style={styles.content}>
            <View>
              {/* Header Shimmer */}
              <View style={styles.headerShimmer}>
                <View style={styles.sourceShimmer}>
                  <View style={styles.sourceDot} />
                  <View style={styles.sourceTextShimmer}>
                    <ShimmerOverlay />
                  </View>
                </View>
                <View style={styles.timeShimmer}>
                  <ShimmerOverlay />
                </View>
              </View>

              {/* Title Shimmer */}
              <View style={styles.titleShimmer}>
                <ShimmerOverlay />
              </View>
              <View style={[styles.titleShimmer, styles.titleShimmerMedium]}>
                <ShimmerOverlay />
              </View>
              <View style={[styles.titleShimmer, styles.titleShimmerShort]}>
                <ShimmerOverlay />
              </View>

              {/* Description Shimmer */}
              <View style={{ marginTop: 16 }}>
                {[1, 2, 3].map((line) => (
                  <View
                    key={line}
                    style={[
                      styles.descriptionShimmer,
                      line === 3 && styles.descriptionShimmerShort,
                    ]}
                  >
                    <ShimmerOverlay />
                  </View>
                ))}
              </View>
            </View>

            {/* Actions Shimmer */}
            <View style={styles.actionsShimmer}>
              {[1, 2, 3].map((action) => (
                <View key={action} style={styles.actionShimmer}>
                  <ShimmerOverlay />
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

export default LoadingShimmer;