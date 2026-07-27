import { Platform, type ViewStyle } from 'react-native';

type ShadowStyle = Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>;

function iosShadow(offset: number, opacity: number, radius: number): ShadowStyle {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offset },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
}

function androidShadow(elevation: number): ShadowStyle {
  return { elevation };
}

export const Shadows: Record<'sm' | 'md' | 'lg', ShadowStyle> = Platform.select({
  ios: {
    sm: iosShadow(1, 0.1, 3),
    md: iosShadow(4, 0.15, 8),
    lg: iosShadow(8, 0.2, 16),
  },
  android: {
    sm: androidShadow(2),
    md: androidShadow(6),
    lg: androidShadow(12),
  },
  default: {
    sm: iosShadow(1, 0.1, 3),
    md: iosShadow(4, 0.15, 8),
    lg: iosShadow(8, 0.2, 16),
  },
});
