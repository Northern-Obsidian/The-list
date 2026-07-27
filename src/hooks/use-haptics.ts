import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function useHaptics() {
  const impactAsync = Haptics.impactAsync;
  const notificationAsync = Haptics.notificationAsync;
  const selectionAsync = Haptics.selectionAsync;

  const light = () => {
    if (Platform.OS === 'web') return;
    impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const medium = () => {
    if (Platform.OS === 'web') return;
    impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const heavy = () => {
    if (Platform.OS === 'web') return;
    impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  };

  const success = () => {
    if (Platform.OS === 'web') return;
    notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const error = () => {
    if (Platform.OS === 'web') return;
    notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  };

  const warning = () => {
    if (Platform.OS === 'web') return;
    notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  };

  const selection = () => {
    if (Platform.OS === 'web') return;
    selectionAsync().catch(() => {});
  };

  return { light, medium, heavy, success, error, warning, selection };
}
