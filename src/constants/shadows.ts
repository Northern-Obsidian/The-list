type ShadowStyle = {
  boxShadow: string;
};

export const Shadows: Record<'sm' | 'md' | 'lg', ShadowStyle> = {
  sm: { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  md: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
  lg: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' },
};
