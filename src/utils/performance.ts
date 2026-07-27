import { memo, type ComponentType } from 'react';

export function typedMemo<T extends ComponentType<unknown>>(component: T): T {
  return memo(component) as unknown as T;
}

export const LIST_OPTIMIZATION_PROPS = {
  windowSize: 10,
  maxToRenderPerBatch: 15,
  initialNumToRender: 10,
  removeClippedSubviews: true,
} as const;
