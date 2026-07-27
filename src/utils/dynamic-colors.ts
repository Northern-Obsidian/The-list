import { Platform } from 'react-native';

export function getMaterialYouPrimary(): string | null {
  if (Platform.OS !== 'android') return null;
  try {
    const { PlatformColor } = require('react-native');
    return PlatformColor('@android:color/system_accent1_0');
  } catch {
    return null;
  }
}

export function getDynamicAccent(): { light: string; dark: string } | null {
  if (Platform.OS !== 'android') return null;
  try {
    const { PlatformColor } = require('react-native');
    return {
      light: PlatformColor('@android:color/system_accent1_500') as unknown as string,
      dark: PlatformColor('@android:color/system_accent1_200') as unknown as string,
    };
  } catch {
    return null;
  }
}

export function supportsMaterialYou(): boolean {
  if (Platform.OS !== 'android') return false;
  if (Platform.Version < 31) return false;
  try {
    const { PlatformColor } = require('react-native');
    PlatformColor('@android:color/system_accent1_0');
    return true;
  } catch {
    return false;
  }
}
