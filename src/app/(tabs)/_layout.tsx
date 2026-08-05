import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="library" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
