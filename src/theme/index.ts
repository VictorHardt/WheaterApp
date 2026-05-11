import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing } from './spacing';

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  }
};

export const Theme = {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
};

export { Colors, Typography, Spacing };
