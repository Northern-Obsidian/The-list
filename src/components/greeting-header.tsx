import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHaptics } from '@/hooks/use-haptics';
import { router } from 'expo-router';

type GreetingHeaderProps = {
  name?: string;
  onSettingsPress?: () => void;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

export function GreetingHeader({ name = 'Chris', onSettingsPress }: GreetingHeaderProps) {
  const theme = useTheme();
  const haptics = useHaptics();

  const handleSettingsPress = () => {
    haptics.light();
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      router.push('/(tabs)/settings');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <ThemedText style={{ fontSize: 14, color: theme.textSecondary }}>
          {getGreeting()}
        </ThemedText>
        <ThemedText style={{ fontSize: 24, fontWeight: '700', color: theme.text }}>
          {name}
        </ThemedText>
      </View>
      <Pressable
        onPress={handleSettingsPress}
        style={({ pressed }) => [
          styles.settingsButton,
          { backgroundColor: theme.backgroundElement },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Icon name="settings" size={20} color={theme.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  textContainer: {
    gap: Spacing.half,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
