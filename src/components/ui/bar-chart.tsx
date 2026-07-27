import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BarChartData = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  title: string;
  data: BarChartData[];
  height?: number;
  barColor?: string;
};

export function BarChart({ title, data, height = 160, barColor }: Props) {
  const theme = useTheme();
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = data.length * 48 + 20;
  const barWidth = 28;

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold" style={styles.title}>{title}</ThemedText>
      {data.length === 0 ? (
        <ThemedText themeColor="textSecondary" type="small" style={styles.empty}>
          No data
        </ThemedText>
      ) : (
        <View style={styles.chartWrapper}>
          <Svg width={chartWidth} height={height}>
            {[0.25, 0.5, 0.75, 1].map((fraction) => (
              <Line
                key={fraction}
                x1="0"
                y1={height - height * fraction}
                x2={chartWidth}
                y2={height - height * fraction}
                stroke={theme.border || theme.backgroundElement}
                strokeWidth={1}
              />
            ))}
            {data.map((d, i) => {
              const x = i * 48 + 10;
              const barH = (d.value / maxValue) * (height - 24);
              const color = d.color || barColor || theme.primary;
              return (
                <>
                  <Rect
                    key={`bar-${i}`}
                    x={x}
                    y={height - 8 - barH}
                    width={barWidth}
                    height={barH}
                    rx={4}
                    fill={color}
                    opacity={0.85}
                  />
                  {d.value > 0 && (
                    <SvgText
                      x={x + barWidth / 2}
                      y={height - 16 - barH}
                      fill={theme.textSecondary}
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {d.value}
                    </SvgText>
                  )}
                  <SvgText
                    x={x + barWidth / 2}
                    y={height - 2}
                    fill={theme.textSecondary}
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {d.label}
                  </SvgText>
                </>
              );
            })}
          </Svg>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.three },
  title: { textTransform: 'uppercase', letterSpacing: 1 },
  empty: { paddingVertical: Spacing.three, textAlign: 'center' },
  chartWrapper: { alignItems: 'center' },
});
