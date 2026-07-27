import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type EmptyStateProps = {
  icon?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
      {title && <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>}
      {description && <ThemedText themeColor="textSecondary" style={styles.description}>{description}</ThemedText>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.six, gap: Spacing.three },
  icon: { fontSize: 64 },
  title: { fontSize: 24, textAlign: 'center' },
  description: { textAlign: 'center', paddingHorizontal: Spacing.four },
  action: { marginTop: Spacing.two },
});
