import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ScreenProps = ViewProps & {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = false, style, ...rest }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const content = (
    <ThemedView style={[styles.container, { paddingTop: insets.top }, style]} {...rest}>
      <View style={[styles.inner, { paddingBottom: insets.bottom + BottomTabInset + Spacing.three }]}>
        {children}
      </View>
    </ThemedView>
  );

  if (scroll) {
    return (
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic">
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
});
