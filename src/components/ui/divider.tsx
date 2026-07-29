import { View, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DividerProps = ViewProps & {
  vertical?: boolean;
};

export function Divider({ vertical, style, ...rest }: DividerProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        { backgroundColor: theme.border || 'rgba(128,128,128,0.2)' },
        vertical
          ? { width: 1, height: '100%', marginHorizontal: Spacing.two }
          : { height: 1, width: '100%', marginVertical: Spacing.two },
        style,
      ]}
      {...rest}
    />
  );
}
