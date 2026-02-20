const palette = {
  white: '#ffffff',
  black: '#0a0a0a',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  green: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
  yellow: { 50: '#fefce8', 500: '#eab308', 700: '#a16207' },
  red: { 50: '#fef2f2', 500: '#ef4444', 700: '#b91c1c' },
  blue: { 50: '#eff6ff', 500: '#3b82f6', 700: '#1d4ed8' },
} as const;

export interface ColorToken {
  bg: string;
  fg: string;
  subtle: string;
  emphasis: string;
  border: string;
}

export interface SemanticColors {
  surface: ColorToken;
  surfaceAlt: ColorToken;
  primary: ColorToken;
  success: ColorToken;
  warning: ColorToken;
  danger: ColorToken;
  info: ColorToken;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
}

const lightColors: SemanticColors = {
  surface: {
    bg: palette.white,
    fg: palette.gray[900],
    subtle: palette.gray[50],
    emphasis: palette.gray[100],
    border: palette.gray[200],
  },
  surfaceAlt: {
    bg: palette.gray[50],
    fg: palette.gray[800],
    subtle: palette.gray[100],
    emphasis: palette.gray[200],
    border: palette.gray[300],
  },
  primary: {
    bg: palette.indigo[600],
    fg: palette.white,
    subtle: palette.indigo[50],
    emphasis: palette.indigo[700],
    border: palette.indigo[300],
  },
  success: {
    bg: palette.green[500],
    fg: palette.white,
    subtle: palette.green[50],
    emphasis: palette.green[700],
    border: palette.green[500],
  },
  warning: {
    bg: palette.yellow[500],
    fg: palette.white,
    subtle: palette.yellow[50],
    emphasis: palette.yellow[700],
    border: palette.yellow[500],
  },
  danger: {
    bg: palette.red[500],
    fg: palette.white,
    subtle: palette.red[50],
    emphasis: palette.red[700],
    border: palette.red[500],
  },
  info: {
    bg: palette.blue[500],
    fg: palette.white,
    subtle: palette.blue[50],
    emphasis: palette.blue[700],
    border: palette.blue[500],
  },
  text: {
    primary: palette.gray[900],
    secondary: palette.gray[500],
    disabled: palette.gray[400],
    inverse: palette.white,
  },
};

const darkColors: SemanticColors = {
  surface: {
    bg: palette.gray[900],
    fg: palette.gray[50],
    subtle: palette.gray[800],
    emphasis: palette.gray[700],
    border: palette.gray[700],
  },
  surfaceAlt: {
    bg: palette.gray[800],
    fg: palette.gray[100],
    subtle: palette.gray[700],
    emphasis: palette.gray[600],
    border: palette.gray[600],
  },
  primary: {
    bg: palette.indigo[500],
    fg: palette.white,
    subtle: palette.indigo[900],
    emphasis: palette.indigo[400],
    border: palette.indigo[700],
  },
  success: {
    bg: palette.green[500],
    fg: palette.white,
    subtle: '#052e16',
    emphasis: palette.green[500],
    border: palette.green[700],
  },
  warning: {
    bg: palette.yellow[500],
    fg: palette.black,
    subtle: '#422006',
    emphasis: palette.yellow[500],
    border: palette.yellow[700],
  },
  danger: {
    bg: palette.red[500],
    fg: palette.white,
    subtle: '#450a0a',
    emphasis: palette.red[500],
    border: palette.red[700],
  },
  info: {
    bg: palette.blue[500],
    fg: palette.white,
    subtle: '#172554',
    emphasis: palette.blue[500],
    border: palette.blue[700],
  },
  text: {
    primary: palette.gray[50],
    secondary: palette.gray[400],
    disabled: palette.gray[600],
    inverse: palette.gray[900],
  },
};

export const fontFamily = {
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  mono: '"Fira Code", ui-monospace, monospace',
  serif: '"Merriweather", ui-serif, serif',
} as const;

export type FontFamily = keyof typeof fontFamily;

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
} as const;

export type FontSize = keyof typeof fontSize;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontWeight = keyof typeof fontWeight;

export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

export type Spacing = keyof typeof spacing;

export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
} as const;

export type BorderRadius = keyof typeof borderRadius;

export const shadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

export type Shadow = keyof typeof shadow;

export interface Theme {
  colors: SemanticColors;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadow: typeof shadow;
  mode: 'light' | 'dark';
}

export const lightTheme: Theme = {
  colors: lightColors,
  fontFamily,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadow,
  mode: 'light',
};

export const darkTheme: Theme = {
  colors: darkColors,
  fontFamily,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadow,
  mode: 'dark',
};
