import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { OnboardingSlide } from '@/components/onboarding/onboarding-slide';

const IMAGES = {
  superman: require('@/assets/onboarding/superman.jpg'),
  sukuna: require('@/assets/onboarding/sukuna.jpg'),
  gojo: require('@/assets/onboarding/gojo.jpg'),
  piece: require('@/assets/onboarding/piece.jpg'),
  king: require('@/assets/onboarding/king.jpg'),
  venom: require('@/assets/onboarding/venom.jpg'),
  sword: require('@/assets/onboarding/sword.jpg'),
  moon: require('@/assets/onboarding/moon.jpg'),
  ocean: require('@/assets/onboarding/ocean.jpg'),
  drama: require('@/assets/onboarding/drama.jpg'),
  download: require('@/assets/onboarding/download.jpg'),
  domain: require('@/assets/onboarding/domain.jpg'),
  arise: require('@/assets/onboarding/arise.jpg'),
  shifa: require('@/assets/onboarding/shifa.jpg'),
  blind: require('@/assets/onboarding/blind.jpg'),
  tom: require('@/assets/onboarding/tom.jpg'),
  ayonokoji: require('@/assets/onboarding/ayonokoji.jpg'),
  alice: require('@/assets/onboarding/alice.jpg'),
  wolf: require('@/assets/onboarding/wolf.jpg'),
};

const SLIDES = [
  {
    id: 'welcome',
    images: [
      IMAGES.superman, IMAGES.sukuna, IMAGES.gojo,
      IMAGES.piece, IMAGES.king,
    ],
    title: 'Your Entertainment\nUniverse',
    subtitle: 'Track every movie, show, anime, and more. Your personal library, always with you.',
    badge: 'Welcome',
    accentColor: '#FF6B6B',
  },
  {
    id: 'track',
    images: [
      IMAGES.venom, IMAGES.sword, IMAGES.moon,
      IMAGES.ocean, IMAGES.drama,
    ],
    title: 'Never Lose Your\nPlace Again',
    subtitle: 'Auto-sync your progress across every series, season, and episode. Pick up right where you left off.',
    badge: 'Smart Tracking',
    accentColor: '#4ECDC4',
  },
  {
    id: 'offline',
    images: [
      IMAGES.tom, IMAGES.download, IMAGES.domain,
      IMAGES.arise, IMAGES.shifa,
    ],
    title: '100% Offline.\n100% Private.',
    subtitle: 'Everything stays on your device. No account needed. No ads. No tracking. Ever.',
    badge: 'Offline First',
    accentColor: '#A78BFA',
  },
  {
    id: 'journey',
    images: [
      IMAGES.blind, IMAGES.ayonokoji, IMAGES.alice,
      IMAGES.wolf,
    ],
    title: 'Your Story.\nBeautifully Told.',
    subtitle: 'Rich analytics, timelines, streaks, and achievements. Watch your entertainment journey come to life.',
    badge: 'Beautiful Analytics',
    accentColor: '#F59E0B',
  },
];

const DOT_SIZE = 8;
const ACTIVE_DOT_SIZE = 24;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const completeOnboarding = useCallback(() => {
    Storage.setItemSync('onboarding_completed', 'true');
    router.replace('/(tabs)');
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      completeOnboarding();
    }
  }, [currentIndex, completeOnboarding]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const renderItem = useCallback(
    ({ item, index }: { item: typeof SLIDES[0]; index: number }) => (
      <OnboardingSlide
        images={item.images.map((source) => ({ source }))}
        slideIndex={index}
        title={item.title}
        subtitle={item.subtitle}
        badge={item.badge}
        accentColor={item.accentColor}
      />
    ),
    [],
  );

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        decelerationRate="fast"
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: currentIndex === i ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                  width: currentIndex === i ? ACTIVE_DOT_SIZE : DOT_SIZE,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {!isLast && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Pressable onPress={handleSkip} style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}>
                <View style={styles.skipInner}>
                  <ThemedText style={styles.skipText}>Skip</ThemedText>
                </View>
              </Pressable>
            </Animated.View>
          )}

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextBtn,
              { backgroundColor: SLIDES[currentIndex].accentColor },
              pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
            ]}
          >
            <View style={styles.nextInner}>
              <ThemedText style={styles.nextText}>
                {isLast ? 'Get Started' : 'Next'}
              </ThemedText>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipBtn: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  skipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  nextBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 140,
    alignItems: 'center',
  },
  nextInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
