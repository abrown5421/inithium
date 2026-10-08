import type { ThemeConfig } from '@inithium/shared-contracts';

/** Core's default theme, used until a client sets their own. Brand colours are 500s; surface is its 100. */
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#006a8e',
    secondary: '#397e7f',
    tertiary: '#64748b',
    quaternary: '#25374f',
    accent: '#f5a42d',
    surface: '#f8fafc',
  },
};
