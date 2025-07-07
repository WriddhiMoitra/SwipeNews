import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LoadingShimmer: React.FC = () => {
  const { theme } = useTheme();
  const shimmerTranslateX = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(SCREEN_WIDTH, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 16,
      height: SCREEN_HEIGHT * 0.75,
    },
    imageShimmer: {
      height: SCREEN_HEIGHT * 0.35,
      backgroundColor: theme.colors.surface,
      position: 'relative',
      overflow: 'hidden',
    },
    content: {
      padding: 24,
      flex: 1,
    },
    titleShimmer: {
      height: 24,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginBottom: 12,
    },
    titleShimmerShort: {
      width: '70%',
    },
    descriptionShimmer: {
      height: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      marginBottom: 8,
    },
    descriptionShimmerShort: {
      width: '60%',
    },
    actionsShimmer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 'auto',
      paddingTop: 16,
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
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      width: 100,
    },
  });

  return (
    <View style={styles.container}>
      {[1, 2].map((index) => (
        <View key={index} style={styles.card}>
          {/* Image Shimmer */}
          <View style={styles.imageShimmer}>
            <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
          </View>

          {/* Content Shimmer */}
          <View style={styles.content}>
            {/* Title Shimmer */}
            <View style={styles.titleShimmer}>
              <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
            </View>
            <View style={[styles.titleShimmer, styles.titleShimmerShort]}>
              <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
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
                  <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
                </View>
              ))}
            </View>

            {/* Actions Shimmer */}
            <View style={styles.actionsShimmer}>
              {[1, 2, 3].map((action) => (
                <View key={action} style={styles.actionShimmer}>
                  <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default LoadingShimmer;