import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { ErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider } from '@/contexts/theme-context';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppLockGuard } from '@/components/app-lock-guard';
import { FloatingTabBar } from '@/components/ui/floating-tab-bar';
import { getDatabase } from '@/db';
import {
  requestNotificationPermissions,
  setupNotificationChannels,
} from '@/services/background-task-service';

SplashScreen.preventAutoHideAsync();

function DatabaseLoading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#3C9FFE" />
      <Text style={styles.loadingText}>Initializing database...</Text>
    </View>
  );
}

function DatabaseError({ error }: { error: Error }) {
  return (
    <View style={styles.loading}>
      <Text style={styles.errorText}>Database Error</Text>
      <Text style={styles.errorDetail}>{error.message}</Text>
    </View>
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      getDatabase();
      setDbReady(true);
    } catch (err) {
      setDbError(err instanceof Error ? err : new Error('Database init failed'));
    }
  }, []);

  useEffect(() => {
    if (dbReady || dbError) {
      SplashScreen.hideAsync();
    }
  }, [dbReady, dbError]);

  useEffect(() => {
    setupNotificationChannels();
    requestNotificationPermissions();
  }, []);

  if (dbError) {
    return <DatabaseError error={dbError} />;
  }

  return (
    <ThemeProvider>
      <AnimatedSplashOverlay />
      {!dbReady && <DatabaseLoading />}
      <ErrorBoundary>
      <AppLockGuard>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 300 }}>
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="media/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="media/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="media/[id]/edit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="media/[id]/review" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="collections/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="collections/[id]/edit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="profile/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="import" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="backup" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="calendar" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="timeline" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="achievements" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="history" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="series/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="series/[id]/season/[seasonNumber]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="series/[id]/episode/[episodeId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="collections/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="tags/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="tags/index" options={{ animation: 'slide_from_right' }} />
        </Stack>
        <FloatingTabBar />
      </AppLockGuard>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    gap: 16,
    zIndex: 9999,
  },
  loadingText: {
    color: '#B0B4BA',
    fontSize: 16,
  },
  errorText: {
    color: '#F87171',
    fontSize: 18,
    fontWeight: '600',
  },
  errorDetail: {
    color: '#B0B4BA',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
