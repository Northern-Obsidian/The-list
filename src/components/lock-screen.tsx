import { useState, useEffect, useCallback } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  authenticateBiometric,
  isBiometricAvailable,
  isBiometricEnabled,
  isLockEnabled,
  verifyPin,
} from '@/services/app-lock-service';

export interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [useBiometric, setUseBiometric] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const lockEnabled = await isLockEnabled();
      if (!lockEnabled) {
        onUnlock();
        return;
      }
      const bioEnabled = await isBiometricEnabled();
      const bioAvailable = await isBiometricAvailable();
      setUseBiometric(bioEnabled && bioAvailable);
      setChecking(false);
      if (bioEnabled && bioAvailable) {
        const ok = await authenticateBiometric();
        if (ok) onUnlock();
      }
    })();
  }, [onUnlock]);

  const handleBiometric = useCallback(async () => {
    const ok = await authenticateBiometric();
    if (ok) onUnlock();
    else setError('Authentication failed');
  }, [onUnlock]);

  const handlePinSubmit = useCallback(async () => {
    const valid = await verifyPin(pin);
    if (valid) {
      onUnlock();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  }, [pin, onUnlock]);

  if (checking) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ThemedView style={[styles.content, { paddingTop: insets.top }]}>
        <ThemedView style={styles.iconContainer}>
          <ThemedText type="title" style={styles.lockIcon}>
            🔒
          </ThemedText>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.title}>
          The_List
        </ThemedText>

        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Enter your PIN to unlock
        </ThemedText>

        <View style={styles.pinContainer}>
          <TextInput
            style={[
              styles.pinInput,
              {
                color: theme.text,
                backgroundColor: theme.backgroundElement,
                borderColor: error ? theme.error || '#F87171' : 'transparent',
              },
            ]}
            value={pin}
            onChangeText={(t) => {
              setPin(t);
              setError('');
            }}
            placeholder="PIN"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            secureTextEntry
            maxLength= {6}
            onSubmitEditing={handlePinSubmit}
            autoFocus
          />
        </View>

        {error ? (
          <ThemedText style={[styles.error, { color: theme.error || '#F87171' }]}>
            {error}
          </ThemedText>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.unlockButton,
            { backgroundColor: theme.primary || theme.backgroundElement },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handlePinSubmit}
        >
          <ThemedText style={styles.unlockText}>Unlock</ThemedText>
        </Pressable>

        {useBiometric && (
          <Pressable
            style={({ pressed }) => [styles.biometricButton, pressed && { opacity: 0.7 }]}
            onPress={handleBiometric}
          >
            <ThemedText themeColor="textSecondary">Use Face ID / Fingerprint</ThemedText>
          </Pressable>
        )}
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  iconContainer: {
    marginBottom: Spacing.two,
  },
  lockIcon: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  pinContainer: {
    width: '100%',
    maxWidth: 280,
  },
  pinInput: {
    height: 52,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 2,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  unlockButton: {
    width: '100%',
    maxWidth: 280,
    height: 48,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  unlockText: {
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
});
