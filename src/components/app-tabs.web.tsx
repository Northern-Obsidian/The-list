import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabTriggerSlotProps,
  type TabListProps,
} from 'expo-router/ui';
import {
  IconHome,
  IconSearch,
  IconBook2,
  IconChartBar,
  IconSettings2,
} from '@tabler/icons-react-native';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const tabs = [
  { name: 'index', href: '/', icon: IconHome },
  { name: 'search', href: '/search', icon: IconSearch },
  { name: 'library', href: '/library', icon: IconBook2 },
  { name: 'stats', href: '/stats', icon: IconChartBar },
  { name: 'settings', href: '/settings', icon: IconSettings2 },
] as const;

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 200,
  mass: 0.5,
};

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {tabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon} />
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  isFocused,
  icon: IconComponent,
  ...props
}: TabTriggerSlotProps & { icon: typeof IconHome }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const scale = useSharedValue(1);
  const activeProgress = useSharedValue(isFocused ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolate(
      activeProgress.value,
      [0, 1],
      [0, 1],
    )
      ? `rgba(60, 159, 254, ${interpolate(activeProgress.value, [0, 1], [0, 0.12])})`
      : 'transparent',
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.82, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  activeProgress.value = withTiming(isFocused ? 1 : 0, { duration: 200 });

  const activeColor = colors.primary || '#3C9FFE';
  const iconColor = isFocused ? activeColor : colors.textSecondary;
  const strokeWidth = isFocused ? 2.5 : 1.8;

  return (
    <AnimatedPressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tabButton, animatedStyle]}>
      <IconComponent size={22} color={iconColor} strokeWidth={strokeWidth} />
    </AnimatedPressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();

  return (
    <View {...props} style={styles.tabListContainer}>
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor: scheme === 'dark' || scheme === 'unspecified'
              ? 'rgba(30, 30, 30, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            borderColor: scheme === 'dark' || scheme === 'unspecified'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.06)',
          },
        ]}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 999,
    maxWidth: MaxContentWidth,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  tabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
