import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';

const ONBOARDING_KEY = 'onboarding_completed';

export default function RootIndex() {
  useEffect(() => {
    const completed = Storage.getItemSync(ONBOARDING_KEY);
    if (completed === 'true') {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3C9FFE" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
