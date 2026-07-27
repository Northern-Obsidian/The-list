import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 3;
const COLS = 6;
const CELL_W = (SCREEN_WIDTH - GAP * (COLS - 1)) / COLS;
const CELL_H = CELL_W * 1.2;

interface LayoutPos {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

const LAYOUTS: LayoutPos[] = [
  { col: 0, row: 0, colSpan: 2, rowSpan: 2 },
  { col: 2, row: 0, colSpan: 2, rowSpan: 2 },
  { col: 4, row: 0, colSpan: 2, rowSpan: 2 },
  { col: 0, row: 2, colSpan: 2, rowSpan: 2 },
  { col: 2, row: 2, colSpan: 2, rowSpan: 2 },
  { col: 4, row: 2, colSpan: 1, rowSpan: 1 },
  { col: 5, row: 2, colSpan: 1, rowSpan: 1 },
  { col: 0, row: 4, colSpan: 2, rowSpan: 1 },
  { col: 2, row: 4, colSpan: 2, rowSpan: 1 },
  { col: 4, row: 4, colSpan: 2, rowSpan: 1 },
  { col: 0, row: 5, colSpan: 2, rowSpan: 1 },
  { col: 2, row: 5, colSpan: 2, rowSpan: 1 },
  { col: 4, row: 5, colSpan: 2, rowSpan: 1 },
  { col: 0, row: 6, colSpan: 3, rowSpan: 1 },
  { col: 3, row: 6, colSpan: 3, rowSpan: 1 },
];

export function ImageGrid({ images, slideIndex: _slideIndex }: { images: { source: number }[]; slideIndex: number }) {
  return (
    <View style={styles.container}>
      {images.slice(0, 15).map((img, i) => {
        const pos = LAYOUTS[i];
        if (!pos) return null;
        const w = pos.colSpan * CELL_W + (pos.colSpan - 1) * GAP;
        const h = pos.rowSpan * CELL_H + (pos.rowSpan - 1) * GAP;
        const l = pos.col * (CELL_W + GAP);
        const t = pos.row * (CELL_H + GAP);

        return (
          <Animated.Image
            key={i}
            source={img.source}
            entering={FadeIn.delay(100 + i * 60).duration(500)}
            style={[
              styles.image,
              {
                left: l,
                top: t,
                width: w,
                height: h,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  image: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: '#1a1a2e',
  },
});
