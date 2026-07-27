import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTheme } from '@/hooks/use-theme';

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  search: 'Search',
  library: 'Library',
  stats: 'Stats',
  settings: 'Settings',
};

export default function AppTabs() {
  const colors = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index" accessibilityLabel="Home" />
      <NativeTabs.Trigger name="search" accessibilityLabel="Search" />
      <NativeTabs.Trigger name="library" accessibilityLabel="Library" />
      <NativeTabs.Trigger name="stats" accessibilityLabel="Statistics" />
      <NativeTabs.Trigger name="settings" accessibilityLabel="Settings" />
    </NativeTabs>
  );
}
