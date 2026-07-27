import { memo, useCallback, useMemo, type ReactElement } from 'react';
import { FlatList, type FlatListProps, type ListRenderItemInfo } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const DEFAULT_STAGGER_DELAY = 80;

type AnimatedListProps<T> = Omit<FlatListProps<T>, 'data' | 'renderItem'> & {
  data: readonly T[];
  renderItem: (_item: T, _index: number) => ReactElement;
  staggerDelay?: number;
};

function AnimatedListItem<T>({
  item,
  index,
  renderItem,
  staggerDelay,
}: {
  item: T;
  index: number;
  renderItem: (_item: T, _index: number) => ReactElement;
  staggerDelay: number;
}) {
  const entering = useMemo(
    () =>
      FadeInDown.duration(300)
        .delay(index * staggerDelay)
        .springify()
        .damping(15)
        .stiffness(100),
    [index, staggerDelay],
  );

  return (
    <Animated.View entering={entering} exiting={FadeOut.duration(200)}>
      {renderItem(item, index)}
    </Animated.View>
  );
}

const MemoizedAnimatedListItem = memo(AnimatedListItem) as typeof AnimatedListItem;

export function AnimatedList<T>({
  data,
  renderItem,
  staggerDelay = DEFAULT_STAGGER_DELAY,
  ...rest
}: AnimatedListProps<T>) {
  const renderListItem = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => (
      <MemoizedAnimatedListItem
        item={item}
        index={index}
        renderItem={renderItem}
        staggerDelay={staggerDelay}
      />
    ),
    [renderItem, staggerDelay],
  );

  const keyExtractor = useCallback(
    (item: unknown, index: number) => (item as Record<string, unknown>).id ?? String(index),
    [],
  );

  return (
    <AnimatedFlatList
      data={data as T[]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderItem={renderListItem as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      keyExtractor={keyExtractor as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(rest as any)}
    />
  );
}
