import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ScreenLoader() {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.scrollContent}
    >
      <ThemedView style={styles.container}>
        <Skeleton height={24} width="60%" borderRadius={6} />
        <Skeleton height={80} borderRadius={12} />
        <Skeleton height={20} width="40%" borderRadius={6} />
        <Skeleton height={100} borderRadius={12} />
        <Skeleton height={100} borderRadius={12} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
});
