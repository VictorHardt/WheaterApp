export const DarkColors = {
  // Backgrounds
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceElevated: '#252540',

  // Texto
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',

  // Accent
  accentBlue: '#4F8EF7',
  accentCyan: '#00D4FF',
  accentOrange: '#FF9A3C',
  accentPurple: '#8B5CF6',

  // Status
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFB74D',

  // Gradientes
  gradientCard: ['#1A1A2E', '#252540'] as const,
  gradientHot: ['#FF9A3C', '#FF6B6B'] as const,
  gradientCold: ['#4F8EF7', '#00D4FF'] as const,
  gradientRain: ['#2C3E6B', '#4F8EF7'] as const,
};

export const LightColors = {
  // Backgrounds
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Texto
  textPrimary: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',

  // Accent
  accentBlue: '#1e88e5',
  accentCyan: '#00ACC1',
  accentOrange: '#F4511E',
  accentPurple: '#8E24AA',

  // Status
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFB74D',

  // Gradientes
  gradientCard: ['#FFFFFF', '#F9FAFB'] as const,
  gradientHot: ['#FFE0B2', '#FFCC80'] as const,
  gradientCold: ['#E3F2FD', '#BBDEFB'] as const,
  gradientRain: ['#E8EAF6', '#C5CAE9'] as const,
};

export const Colors = DarkColors;
