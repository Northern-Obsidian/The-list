import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { usePathname, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import {
  IconHome,
  IconSearch,
  IconBook2,
  IconChartBar,
  IconUser,
} from '@tabler/icons-react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHaptics } from '@/hooks/use-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 200,
  mass: 0.5,
};

type TabItem = {
  key: string;
  route: string;
  label: string;
  icon: typeof IconHome;
  match: (pathname: string) => boolean;
};

const TABS: TabItem[] = [
  {
    key: 'home',
    route: '/(tabs)',
    label: 'Home',
    icon: IconHome,
    match: (p) => p === '/' || p === '/(tabs)' || p === '/(tabs)/',
  },
  {
    key: 'search',
    route: '/(tabs)/search',
    label: 'Discover',
    icon: IconSearch,
    match: (p) => p.startsWith('/(tabs)/search'),
  },
  {
    key: 'library',
    route: '/(tabs)/library',
    label: 'Library',
    icon: IconBook2,
    match: (p) => p.startsWith('/(tabs)/library'),
  },
  {
    key: 'stats',
    route: '/(tabs)/stats',
    label: 'Insights',
    icon: IconChartBar,
    match: (p) => p.startsWith('/(tabs)/stats'),
  },
  {
    key: 'settings',
    route: '/(tabs)/settings',
    label: 'You',
    icon: IconUser,
    match: (p) => p.startsWith('/(tabs)/settings'),
  },
];

function TabButton({
  tab,
  isActive,
  onPress,
}: {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.85, SPRING_CONFIG);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  const IconComponent = tab.icon;
  const iconColor = isActive ? theme.primary : theme.textSecondary;
  const strokeWidth = isActive ? 2.2 : 1.8;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tabButton, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isActive }}
    >
      {isActive && (
        <View
          style={[
            styles.activeIndicator,
            { backgroundColor: theme.primary },
          ]}
        />
      )}
      <IconComponent
        size={22}
        color={iconColor}
        strokeWidth={strokeWidth}
      />
      {isActive && (
        <Animated.View entering={FadeIn.duration(200)}>
          <ThemedText
            style={[styles.label, { color: theme.primary }]}
          >
            {tab.label}
          </ThemedText>
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

export function FloatingTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const haptics = useHaptics();

  const isTabScreen = pathname.startsWith('/(tabs)');
  if (!isTabScreen) {
    return null;
  }

  const handleTabPress = useCallback(
    (route: string) => {
      haptics.light();
      router.replace(route as any);
    },
    [haptics],
  );

  return (
    <View style={[styles.container, { bottom: insets.bottom + 8 }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.glass,
            borderColor: theme.glassBorder,
          },
        ]}
      >
        {TABS.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <TabButton
              key={tab.key}
              tab={tab}
              isActive={isActive}
              onPress={() => handleTabPress(tab.route)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  tabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    opacity: 0.12,
  },
  label: {
    fontSize: 10,
    marginTop: Spacing.half,
    fontWeight: '600',
  },
});
