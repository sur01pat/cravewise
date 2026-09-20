export const Colors = {
  // Brand palette – warm, optimistic
  primary: '#E8743B',       // warm orange
  primaryLight: '#FDF0E8',
  secondary: '#5B8E7D',     // sage green
  secondaryLight: '#EAF3F0',
  accent: '#F2C94C',        // warm yellow

  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F3EF',

  text: '#1C1917',
  textMuted: '#6B6560',
  textLight: '#9E9892',

  border: '#E8E4DE',
  divider: '#F0EDE8',

  success: '#4CAF8D',
  warning: '#F2C94C',
  error: '#E07070',

  white: '#FFFFFF',
  black: '#000000',
};

export const Typography = {
  fontSizeXS: 11,
  fontSizeSM: 13,
  fontSizeMD: 15,
  fontSizeLG: 17,
  fontSizeXL: 20,
  fontSize2XL: 24,
  fontSize3XL: 30,

  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemiBold: '600' as const,
  fontWeightBold: '700' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
};
