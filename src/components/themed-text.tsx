import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'default' | 'body' | 'bodySmall' | 'caption' | 'label' | 'button' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'display' && styles.display,
        type === 'h1' && styles.h1,
        type === 'h2' && styles.h2,
        type === 'h3' && styles.h3,
        type === 'h4' && styles.h4,
        type === 'default' && styles.default,
        type === 'body' && styles.body,
        type === 'bodySmall' && styles.bodySmall,
        type === 'caption' && styles.caption,
        type === 'label' && styles.label,
        type === 'button' && styles.buttonLabel,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '700',
    fontFamily: Fonts.heading,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    fontFamily: Fonts.heading,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    fontFamily: Fonts.heading,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    fontFamily: Fonts.heading,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: Fonts.heading,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: Fonts.sans,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: Fonts.sans,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: Fonts.sans,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: Fonts.sans,
  },
  buttonLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    fontFamily: Fonts.sans,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
    fontFamily: Fonts.sans,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
    fontFamily: Fonts.sans,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
    fontFamily: Fonts.heading,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
    fontFamily: Fonts.heading,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
