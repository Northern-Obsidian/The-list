import { useCallback } from 'react';
import { useSharedValue, withSpring, type WithSpringConfig } from 'react-native-reanimated';

const SPRING_CONFIG: WithSpringConfig = {
  damping: 15,
  stiffness: 200,
  mass: 0.5,
};

export function useScalePress() {
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.96, SPRING_CONFIG);
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}

export function useFadePress() {
  const opacity = useSharedValue(1);

  const onPressIn = useCallback(() => {
    opacity.value = withSpring(0.7, SPRING_CONFIG);
  }, [opacity]);

  const onPressOut = useCallback(() => {
    opacity.value = withSpring(1, SPRING_CONFIG);
  }, [opacity]);

  return { opacity, onPressIn, onPressOut };
}
