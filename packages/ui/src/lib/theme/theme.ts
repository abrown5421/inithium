export type ColorMode = 'light' | 'dark';

export interface ColorSlot {
  bg: string;
  text: string;
  border: string;
  hover: string;
  active: string;
  subtle: string;
}

export interface ThemeColors {
  primary: ColorSlot;
  secondary: ColorSlot;
  accent: ColorSlot;
  neutral: ColorSlot;
  success: ColorSlot;
  error: ColorSlot;
  warning: ColorSlot;
  info: ColorSlot;
  surface: ColorSlot;
}

export interface Theme {
  mode: ColorMode;
  colors: ThemeColors;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: {
      bg: '#1D4ED8',
      text: '#FFFFFF',
      border: '#1E40AF',
      hover: '#2563EB',
      active: '#1E3A8A',
      subtle: '#DBEAFE',
    },
    secondary: {
      bg: '#9333EA',
      text: '#FFFFFF',
      border: '#7E22CE',
      hover: '#A855F7',
      active: '#6B21A8',
      subtle: '#F3E8FF',
    },
    accent: {
      bg: '#F59E0B',
      text: '#000000',
      border: '#D97706',
      hover: '#FBBF24',
      active: '#B45309',
      subtle: '#FEF3C7',
    },
    neutral: {
      bg: '#F3F4F6',
      text: '#111827',
      border: '#E5E7EB',
      hover: '#E5E7EB',
      active: '#D1D5DB',
      subtle: '#F9FAFB',
    },
    surface: {
      bg: '#FFFFFF',
      text: '#111827',
      border: '#E5E7EB',
      hover: '#F3F4F6',
      active: '#E5E7EB',
      subtle: '#FAFAFA',
    },
    success: {
      bg: '#10B981',
      text: '#FFFFFF',
      border: '#059669',
      hover: '#34D399',
      active: '#047857',
      subtle: '#D1FAE5',
    },
    error: {
      bg: '#EF4444',
      text: '#FFFFFF',
      border: '#DC2626',
      hover: '#F87171',
      active: '#B91C1C',
      subtle: '#FEE2E2',
    },
    warning: {
      bg: '#FACC15',
      text: '#000000',
      border: '#EAB308',
      hover: '#FDE047',
      active: '#CA8A04',
      subtle: '#FEF9C3',
    },
    info: {
      bg: '#3B82F6',
      text: '#FFFFFF',
      border: '#2563EB',
      hover: '#60A5FA',
      active: '#1D4ED8',
      subtle: '#DBEAFE',
    },
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: {
      bg: '#3B82F6',
      text: '#000000',
      border: '#1D4ED8',
      hover: '#60A5FA',
      active: '#1E40AF',
      subtle: '#1E3A8A',
    },
    secondary: {
      bg: '#A78BFA',
      text: '#000000',
      border: '#7C3AED',
      hover: '#C4B5FD',
      active: '#6D28D9',
      subtle: '#2E1065',
    },
    accent: {
      bg: '#FBBF24',
      text: '#000000',
      border: '#F59E0B',
      hover: '#FCD34D',
      active: '#D97706',
      subtle: '#78350F',
    },
    neutral: {
      bg: '#111827',
      text: '#F3F4F6',
      border: '#374151',
      hover: '#1F2937',
      active: '#4B5563',
      subtle: '#020617',
    },
    surface: {
      bg: '#1F2937',
      text: '#F9FAFB',
      border: '#374151',
      hover: '#374151',
      active: '#4B5563',
      subtle: '#020617',
    },
    success: {
      bg: '#34D399',
      text: '#000000',
      border: '#10B981',
      hover: '#6EE7B7',
      active: '#059669',
      subtle: '#064E3B',
    },
    error: {
      bg: '#F87171',
      text: '#000000',
      border: '#EF4444',
      hover: '#FCA5A5',
      active: '#DC2626',
      subtle: '#7F1D1D',
    },
    warning: {
      bg: '#FCD34D',
      text: '#000000',
      border: '#FACC15',
      hover: '#FDE68A',
      active: '#EAB308',
      subtle: '#78350F',
    },
    info: {
      bg: '#60A5FA',
      text: '#000000',
      border: '#3B82F6',
      hover: '#93C5FD',
      active: '#2563EB',
      subtle: '#1E3A8A',
    },
  },
};
