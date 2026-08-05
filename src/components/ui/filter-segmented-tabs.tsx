import { ScrollView, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/hooks/use-theme';

export type FilterSegmentedTabsProps = {
  items: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
  style?: ViewStyle;
};

function ScaleTab({
  children,
  isActive,
  onPress,
  style,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      onPress={onPress}
      style={[style, animStyle as any]}
      accessibilityRole="button"
      accessibilityState={isActive ? { selected: true } : undefined}
    >
      {children}
    </Pressable>
  );
}

export function FilterSegmentedTabs({ items, selected, onSelect, style }: FilterSegmentedTabsProps) {
  const theme = useTheme();
  const haptics = useHaptics();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, style]}
      contentContainerStyle={styles.content}
    >
      {items.map((item) => {
        const isActive = item.key === selected;
        return (
          <ScaleTab
            key={item.key}
            isActive={isActive}
            onPress={() => {
              haptics.light();
              onSelect(item.key);
            }}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? theme.primary : 'transparent',
              },
            ]}
          >
            <ThemedText
              style={[
                styles.label,
                {
                  color: isActive ? '#FFFFFF' : theme.textSecondary,
                },
              ]}
            >
              {item.label}
            </ThemedText>
          </ScaleTab>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  content: {
    gap: Spacing.two,
  },
  tab: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderCurve: 'continuous',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
