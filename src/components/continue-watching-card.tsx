import { Pressable, StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHaptics } from '@/hooks/use-haptics';
import { router } from 'expo-router';

type ContinueWatchingCardProps = {
  id: string;
  title: string;
  subtitle?: string;
  progress: number;
  timeRemaining?: string;
  onPress?: () => void;
};

export function ContinueWatchingCard({
  id,
  title,
  subtitle,
  progress,
  timeRemaining,
  onPress,
}: ContinueWatchingCardProps) {
  const theme = useTheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    haptics.light();
    if (onPress) {
      onPress();
    } else {
      router.push(`/media/${id}`);
    }
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.card, { backgroundColor: theme.backgroundTertiary }]}>
          <View style={styles.playButton}>
            <View style={[styles.playButtonCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Icon name="player-play" size={24} color="#FFFFFF" />
            </View>
          </View>

          <View style={[styles.bottomOverlay, { backgroundColor: theme.overlay }]}>
            <ThemedText style={[styles.title, { color: '#FFFFFF' }]} numberOfLines={1}>
              {title}
            </ThemedText>

            {subtitle ? (
              <ThemedText style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>
                {subtitle}
              </ThemedText>
            ) : null}

            <View style={styles.progressRow}>
              <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.primary,
                      width: `${clampedProgress * 100}%` as DimensionValue,
                    },
                  ]}
                />
              </View>

              <View style={styles.progressInfo}>
                <ThemedText style={[styles.progressPercent, { color: '#FFFFFF' }]}>
                  {Math.round(clampedProgress * 100)}%
                </ThemedText>
                {timeRemaining ? (
                  <ThemedText style={[styles.timeRemaining, { color: '#FFFFFF' }]}>
                    {timeRemaining}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  card: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden' },
  playButton: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  playButtonCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  bottomOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.four },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  subtitle: { fontSize: 13, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressPercent: { fontSize: 12, fontWeight: '600' },
  timeRemaining: { fontSize: 12 },
});
