import { useEffect, useRef } from 'react';
import { Animated, type DimensionValue, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export type SkeletonProps = ViewProps & {
  width?: number | string;
  height?: number;
  borderRadius?: number;
};

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style, ...rest }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as DimensionValue, height, borderRadius, backgroundColor: theme.skeleton, opacity },
        style,
      ]}
      {...rest}
    />
  );
}
