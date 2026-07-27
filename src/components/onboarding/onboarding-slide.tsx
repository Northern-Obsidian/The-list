import { Dimensions, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ImageGrid } from './image-grid';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlideProps {
  images: { source: ImageSourcePropType }[];
  slideIndex: number;
  title: string;
  subtitle: string;
  badge?: string;
  accentColor?: string;
}

export function OnboardingSlide({
  images,
  slideIndex,
  title,
  subtitle,
  badge,
  accentColor = '#3C9FFE',
}: OnboardingSlideProps) {
  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      <View style={styles.imageContainer}>
        <ImageGrid images={images as { source: number }[]} slideIndex={slideIndex} />
        <View style={[styles.gradient, { backgroundColor: 'transparent' }]}>
          <View style={styles.gradientTop} />
          <View style={styles.gradientBottom} />
        </View>
      </View>

      <View style={styles.content}>
        {badge && (
          <Animated.View
            entering={FadeIn.delay(300).duration(500)}
            style={[styles.badge, { backgroundColor: accentColor + '30', borderColor: accentColor + '60' }]}
          >
            <ThemedText style={[styles.badgeText, { color: accentColor }]}>
              {badge}
            </ThemedText>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(400).duration(500).springify()}>
          <ThemedText style={styles.title}>{title}</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(550).duration(500).springify()}>
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  content: {
    position: 'absolute',
    bottom: 120,
    left: 32,
    right: 32,
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.75)',
    maxWidth: '90%',
  },
});
