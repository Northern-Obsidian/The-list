import { ScrollView, Pressable, StyleSheet, View, Text } from 'react-native';
import { useThemeContext } from '@/contexts/theme-context';
import { themeMap, type ThemeKey } from '@/constants/theme';
import { Spacing } from '@/constants/theme';

const THEME_OPTIONS: { key: ThemeKey; label: string; preview: string }[] = [
  { key: 'system', label: 'System', preview: '#3C9FFE' },
  { key: 'dark', label: 'Dark', preview: '#121212' },
  { key: 'amoled', label: 'AMOLED', preview: '#000000' },
  { key: 'light', label: 'Light', preview: '#FFFFFF' },
  { key: 'glass', label: 'Glass', preview: 'rgba(255,255,255,0.5)' },
  { key: 'cyberpunk', label: 'Cyberpunk', preview: '#ff00ff' },
  { key: 'neon', label: 'Neon', preview: '#00ffff' },
  { key: 'minimal', label: 'Minimal', preview: '#333333' },
];

export function ThemePicker() {
  const { themeKey, setThemeKey, theme } = useThemeContext();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>Theme</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {THEME_OPTIONS.map((option) => {
          const isActive = themeKey === option.key;
          const colors = themeMap[option.key === 'system' ? 'dark' : option.key];
          return (
            <Pressable
              key={option.key}
              onPress={() => setThemeKey(option.key)}
              style={[
                styles.option,
                {
                  backgroundColor: colors.card,
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
            >
              <View style={[styles.preview, { backgroundColor: option.preview }]} />
              <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scroll: {
    gap: Spacing.two,
    paddingVertical: Spacing.half,
  },
  option: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    borderWidth: 2,
  },
  preview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
