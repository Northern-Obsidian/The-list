import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export type ProgressBarProps = ViewProps & {
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
  animated?: boolean;
};

export function ProgressBar({ progress, height = 8, color, trackColor, style, ...rest }: ProgressBarProps) {
  const theme = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[
        { height, borderRadius: height / 2, backgroundColor: trackColor || theme.background, overflow: 'hidden' },
        style,
      ]}
      {...rest}
    >
      <View
        style={{
          width: `${clampedProgress * 100}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color || theme.primary,
        }}
      />
    </View>
  );
}
