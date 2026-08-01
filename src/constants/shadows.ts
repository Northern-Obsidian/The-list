type ShadowStyle = {
  boxShadow: string;
};

export const Shadows: Record<'sm' | 'md' | 'lg' | 'xl', ShadowStyle> = {
  sm: { boxShadow: '0 1px 2px rgba(225, 29, 72, 0.05)' },
  md: { boxShadow: '0 4px 6px rgba(225, 29, 72, 0.1)' },
  lg: { boxShadow: '0 10px 15px rgba(225, 29, 72, 0.1)' },
  xl: { boxShadow: '0 20px 25px rgba(225, 29, 72, 0.15)' },
};
